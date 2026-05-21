import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { Broadcast, BroadcastTracking } from "@/models/Broadcast.Model";
import Membership from "@/models/Membership.Model";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { sendInternalMessage } from "@/lib/internalMessages";
import connectDB from "@/lib/mongodb";

// GET all broadcasts
export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");

    const query = {};
    if (status) query.status = status;

    const broadcasts = await Broadcast.find(query)
      .populate("sender", "fullName email")
      .populate("individualRecipients", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Broadcast.countDocuments(query);

    return NextResponse.json({
      broadcasts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    return NextResponse.json({ error: "Failed to fetch broadcasts" }, { status: 500 });
  }
}

// POST create new broadcast
export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, content, sendingMethod, recipientType, recipientGroups, individualRecipients, scheduledFor } = body;

    // Validate required fields
    if (!subject || !content || !sendingMethod || !recipientType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate recipient selection
    if (recipientType === "group" && (!recipientGroups || recipientGroups.length === 0)) {
      return NextResponse.json({ error: "Please select at least one recipient group" }, { status: 400 });
    }

    if (recipientType === "individual" && (!individualRecipients || individualRecipients.length === 0)) {
      return NextResponse.json({ error: "Please select at least one recipient" }, { status: 400 });
    }

    // Get recipients based on selection
    let recipients = [];
    if (recipientType === "all") {
      recipients = await Membership.find({ membershipStatus: "approved" });
    } else if (recipientType === "group") {
      recipients = await Membership.find({ 
        membershipStatus: "approved",
        membershipType: { $in: recipientGroups }
      });
    } else if (recipientType === "individual") {
      recipients = await Membership.find({ 
        _id: { $in: individualRecipients },
        membershipStatus: "approved"
      });
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No valid recipients found" }, { status: 400 });
    }

    // Create broadcast
    const broadcast = new Broadcast({
      subject,
      content,
      sender: session.user.id,
      sendingMethod,
      recipientType,
      recipientGroups: recipientGroups || [],
      individualRecipients: individualRecipients || [],
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      status: scheduledFor ? "pending" : "sending"
    });

    await broadcast.save();

    // Create tracking records for each recipient
    const trackingRecords = [];
    for (const recipient of recipients) {
      if (sendingMethod === "all") {
        // Create tracking for each method
        ["email", "sms", "message"].forEach(method => {
          trackingRecords.push({
            broadcast: broadcast._id,
            recipient: recipient._id,
            sendingMethod: method,
            status: scheduledFor ? "pending" : "pending"
          });
        });
      } else {
        trackingRecords.push({
          broadcast: broadcast._id,
          recipient: recipient._id,
          sendingMethod,
          status: scheduledFor ? "pending" : "pending"
        });
      }
    }

    await BroadcastTracking.insertMany(trackingRecords);

    // If not scheduled, start sending immediately
    if (!scheduledFor) {
      // Send messages to recipients
      const sendPromises = [];
      
      for (const recipient of recipients) {
        if (sendingMethod === "email" || sendingMethod === "all") {
          const emailPromise = sendEmail({
            to: recipient.email,
            subject: subject,
            text: content,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">${subject}</h2>
              <div style="color: #666; line-height: 1.6;">${content.replace(/\n/g, '<br>')}</div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">
                This message was sent to ${recipient.firstName} ${recipient.lastName} 
                (${recipient.email}) by the Pashupatinath Norway administration.
              </p>
            </div>`
          }).then(async () => {
            // Update tracking record to sent
            await BroadcastTracking.updateOne(
              { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "email" },
              { status: "sent", sentAt: new Date() }
            );
          }).catch(async (error) => {
            console.error(`Failed to send email to ${recipient.email}:`, error);
            // Update tracking record to failed
            await BroadcastTracking.updateOne(
              { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "email" },
              { status: "failed", errorMessage: error.message }
            );
          });
          sendPromises.push(emailPromise);
        }
        
        // Send SMS
        if (sendingMethod === "sms" || sendingMethod === "all") {
          if (recipient.phone) {
            const smsPromise = sendSMS({
              to: recipient.phone,
              body: `${subject}\n\n${content}\n\n- Pashupatinath Norway Temple`
            }).then(async () => {
              // Update tracking record to sent
              await BroadcastTracking.updateOne(
                { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "sms" },
                { status: "sent", sentAt: new Date() }
              );
            }).catch(async (error) => {
              console.error(`Failed to send SMS to ${recipient.phone}:`, error);
              // Update tracking record to failed
              await BroadcastTracking.updateOne(
                { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "sms" },
                { status: "failed", errorMessage: error.message }
              );
            });
            sendPromises.push(smsPromise);
          } else {
            // No phone number, mark as failed
            sendPromises.push(
              BroadcastTracking.updateOne(
                { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "sms" },
                { status: "failed", errorMessage: "No phone number available" }
              )
            );
          }
        }
        
        // Send internal message
        if (sendingMethod === "message" || sendingMethod === "all") {
          const messagePromise = sendInternalMessage({
            recipient: recipient._id,
            senderEmail: session.user.email,
            subject: subject,
            content: content,
            relatedBroadcast: broadcast._id
          }).then(async () => {
            // Update tracking record to sent
            await BroadcastTracking.updateOne(
              { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "message" },
              { status: "sent", sentAt: new Date() }
            );
          }).catch(async (error) => {
            console.error(`Failed to send internal message to ${recipient._id}:`, error);
            // Update tracking record to failed
            await BroadcastTracking.updateOne(
              { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "message" },
              { status: "failed", errorMessage: error.message }
            );
          });
          sendPromises.push(messagePromise);
        }
      }
      
      // Wait for all sending operations to complete
      await Promise.allSettled(sendPromises);
      
      broadcast.status = "sent";
      broadcast.sentAt = new Date();
      await broadcast.save();
    }

    return NextResponse.json({ 
      message: "Broadcast created successfully", 
      broadcast,
      recipientCount: recipients.length 
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating broadcast:", error);
    return NextResponse.json({ error: "Failed to create broadcast" }, { status: 500 });
  }
}

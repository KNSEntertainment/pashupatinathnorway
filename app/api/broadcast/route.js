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
    console.log("Broadcast Debug - recipientType:", recipientType);
    console.log("Broadcast Debug - recipientGroups:", recipientGroups);
    console.log("Broadcast Debug - individualRecipients:", individualRecipients);
    
    if (recipientType === "all") {
      recipients = await Membership.find({ membershipStatus: "approved" });
      console.log("Broadcast Debug - Found recipients for 'all':", recipients.length);
    } else if (recipientType === "group") {
      recipients = await Membership.find({ 
        membershipStatus: "approved",
        membershipType: { $in: recipientGroups }
      });
      console.log("Broadcast Debug - Found recipients for groups:", recipients.length);
      console.log("Broadcast Debug - Recipient groups queried:", recipientGroups);
    } else if (recipientType === "individual") {
      recipients = await Membership.find({ 
        _id: { $in: individualRecipients },
        membershipStatus: "approved"
      });
      console.log("Broadcast Debug - Found recipients for individual:", recipients.length);
    }

    console.log("Broadcast Debug - Total recipients found:", recipients.length);
    console.log("Broadcast Debug - Sample recipient data:", recipients.slice(0, 2).map(r => ({ id: r._id, email: r.email, membershipType: r.membershipType })));

    if (recipients.length === 0) {
      console.log("Broadcast Debug - ERROR: No valid recipients found");
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

    // Helper function to process items in batches with delay
    const processInBatches = async (items, batchSize, delayMs, processFn) => {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.allSettled(batch.map(processFn));
        
        // Add delay between batches (except for the last batch)
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    };

    // If not scheduled, start sending immediately
    if (!scheduledFor) {
      console.log("Broadcast Debug - Starting immediate send process");
      console.log("Broadcast Debug - Sending method:", sendingMethod);
      console.log("Broadcast Debug - Number of recipients to send to:", recipients.length);
      
      // Process emails in batches to respect rate limit (5 requests per second)
      if (sendingMethod === "email" || sendingMethod === "all") {
        console.log("Broadcast Debug - Sending emails in batches to respect rate limit");
        await processInBatches(recipients, 5, 1000, async (recipient) => {
          console.log("Broadcast Debug - Processing recipient:", recipient.email, "Type:", recipient.membershipType);
          console.log("Broadcast Debug - Attempting to send email to:", recipient.email);
          
          try {
            await sendEmail({
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
            });
            console.log("Broadcast Debug - Email sent successfully to:", recipient.email);
            // Update tracking record to sent
            await BroadcastTracking.updateOne(
              { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "email" },
              { status: "sent", sentAt: new Date() }
            );
          } catch (error) {
            console.error(`Broadcast Debug - Failed to send email to ${recipient.email}:`, error);
            // Update tracking record to failed
            await BroadcastTracking.updateOne(
              { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "email" },
              { status: "failed", errorMessage: error.message }
            );
          }
        });
      }
      
      // Process SMS in batches
      if (sendingMethod === "sms" || sendingMethod === "all") {
        console.log("Broadcast Debug - Sending SMS messages");
        await processInBatches(recipients, 5, 1000, async (recipient) => {
          if (recipient.phone) {
            try {
              await sendSMS({
                to: recipient.phone,
                body: `${subject}\n\n${content}\n\n- Pashupatinath Norway Temple`
              });
              // Update tracking record to sent
              await BroadcastTracking.updateOne(
                { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "sms" },
                { status: "sent", sentAt: new Date() }
              );
            } catch (error) {
              console.error(`Failed to send SMS to ${recipient.phone}:`, error);
              // Update tracking record to failed
              await BroadcastTracking.updateOne(
                { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "sms" },
                { status: "failed", errorMessage: error.message }
              );
            }
          } else {
            // No phone number, mark as failed
            await BroadcastTracking.updateOne(
              { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "sms" },
              { status: "failed", errorMessage: "No phone number available" }
            );
          }
        });
      }
      
      // Process internal messages in batches
      if (sendingMethod === "message" || sendingMethod === "all") {
        console.log("Broadcast Debug - Sending internal messages");
        await processInBatches(recipients, 10, 500, async (recipient) => {
          try {
            await sendInternalMessage({
              recipient: recipient._id,
              senderEmail: session.user.email,
              subject: subject,
              content: content,
              relatedBroadcast: broadcast._id
            });
            // Update tracking record to sent
            await BroadcastTracking.updateOne(
              { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "message" },
              { status: "sent", sentAt: new Date() }
            );
          } catch (error) {
            console.error(`Failed to send internal message to ${recipient._id}:`, error);
            // Update tracking record to failed
            await BroadcastTracking.updateOne(
              { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "message" },
              { status: "failed", errorMessage: error.message }
            );
          }
        });
      }
      
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

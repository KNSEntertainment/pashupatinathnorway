import { NextResponse } from "next/server";
import { Broadcast, BroadcastTracking } from "@/models/Broadcast.Model";
import Membership from "@/models/Membership.Model";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { sendInternalMessage } from "@/lib/internalMessages";
import connectDB from "@/lib/mongodb";

// GET process scheduled broadcasts
export async function GET() {
  try {
    await connectDB();
    
    // For security, you might want to add a secret key check
    // Optional: Add a secret key for security
    // if (secret !== process.env.BROADCAST_CRON_SECRET) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    console.log("Processing scheduled broadcasts...");
    
    // Find broadcasts that are scheduled to be sent now or earlier
    const now = new Date();
    const scheduledBroadcasts = await Broadcast.find({
      status: "pending",
      scheduledFor: { $lte: now }
    }).populate("sender", "fullName email");

    if (scheduledBroadcasts.length === 0) {
      console.log("No scheduled broadcasts to process");
      return NextResponse.json({ 
        message: "No scheduled broadcasts to process",
        processed: 0
      });
    }

    console.log(`Found ${scheduledBroadcasts.length} scheduled broadcasts to process`);

    let totalProcessed = 0;

    for (const broadcast of scheduledBroadcasts) {
      try {
        console.log(`Processing broadcast: ${broadcast.subject}`);
        
        // Update status to sending
        broadcast.status = "sending";
        await broadcast.save();

        // Get recipients based on selection
        let recipients = [];
        if (broadcast.recipientType === "all") {
          recipients = await Membership.find({ membershipStatus: "approved" });
        } else if (broadcast.recipientType === "group") {
          recipients = await Membership.find({ 
            membershipStatus: "approved",
            membershipType: { $in: broadcast.recipientGroups }
          });
        } else if (broadcast.recipientType === "individual") {
          recipients = await Membership.find({ 
            _id: { $in: broadcast.individualRecipients },
            membershipStatus: "approved"
          });
        }

        if (recipients.length === 0) {
          console.log(`No valid recipients found for broadcast: ${broadcast.subject}`);
          broadcast.status = "failed";
          await broadcast.save();
          continue;
        }

        // Send messages to recipients
        const sendPromises = [];
        
        for (const recipient of recipients) {
          // Send Email
          if (broadcast.sendingMethod === "email" || broadcast.sendingMethod === "all") {
            const emailPromise = sendEmail({
              to: recipient.email,
              subject: broadcast.subject,
              text: broadcast.content,
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">${broadcast.subject}</h2>
                <div style="color: #666; line-height: 1.6;">${broadcast.content.replace(/\n/g, '<br>')}</div>
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
          if (broadcast.sendingMethod === "sms" || broadcast.sendingMethod === "all") {
            if (recipient.phone) {
              const smsPromise = sendSMS({
                to: recipient.phone,
                body: `${broadcast.subject}\n\n${broadcast.content}\n\n- Pashupatinath Norway Temple`
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
          if (broadcast.sendingMethod === "message" || broadcast.sendingMethod === "all") {
            const messagePromise = sendInternalMessage({
              recipient: recipient._id,
              senderEmail: broadcast.sender.email,
              subject: broadcast.subject,
              content: broadcast.content,
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
        
        // Update broadcast status
        broadcast.status = "sent";
        broadcast.sentAt = new Date();
        await broadcast.save();
        
        totalProcessed++;
        console.log(`Successfully processed broadcast: ${broadcast.subject}`);
        
      } catch (error) {
        console.error(`Error processing broadcast ${broadcast._id}:`, error);
        broadcast.status = "failed";
        await broadcast.save();
      }
    }

    console.log(`Completed processing. Total broadcasts processed: ${totalProcessed}`);

    return NextResponse.json({ 
      message: "Scheduled broadcasts processed successfully",
      processed: totalProcessed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error processing scheduled broadcasts:", error);
    return NextResponse.json({ 
      error: "Failed to process scheduled broadcasts",
      details: error.message 
    }, { status: 500 });
  }
}

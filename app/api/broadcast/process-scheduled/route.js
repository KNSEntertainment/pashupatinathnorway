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
        console.log("Scheduled Broadcast Debug - recipientType:", broadcast.recipientType);
        console.log("Scheduled Broadcast Debug - recipientGroups:", broadcast.recipientGroups);
        console.log("Scheduled Broadcast Debug - individualRecipients:", broadcast.individualRecipients);
        
        if (broadcast.recipientType === "all") {
          recipients = await Membership.find({ membershipStatus: "approved" });
          console.log("Scheduled Broadcast Debug - Found recipients for 'all':", recipients.length);
        } else if (broadcast.recipientType === "group") {
          recipients = await Membership.find({ 
            membershipStatus: "approved",
            membershipType: { $in: broadcast.recipientGroups }
          });
          console.log("Scheduled Broadcast Debug - Found recipients for groups:", recipients.length);
          console.log("Scheduled Broadcast Debug - Recipient groups queried:", broadcast.recipientGroups);
        } else if (broadcast.recipientType === "individual") {
          recipients = await Membership.find({ 
            _id: { $in: broadcast.individualRecipients },
            membershipStatus: "approved"
          });
          console.log("Scheduled Broadcast Debug - Found recipients for individual:", recipients.length);
        }

        console.log("Scheduled Broadcast Debug - Total recipients found:", recipients.length);
        console.log("Scheduled Broadcast Debug - Sample recipient data:", recipients.slice(0, 2).map(r => ({ id: r._id, email: r.email, membershipType: r.membershipType })));

        if (recipients.length === 0) {
          console.log(`Scheduled Broadcast Debug - ERROR: No valid recipients found for broadcast: ${broadcast.subject}`);
          broadcast.status = "failed";
          await broadcast.save();
          continue;
        }

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

        // Send messages to recipients
        console.log("Scheduled Broadcast Debug - Starting send process for", recipients.length, "recipients");
        console.log("Scheduled Broadcast Debug - Sending method:", broadcast.sendingMethod);
        
        // Process emails in batches to respect rate limit (5 requests per second)
        if (broadcast.sendingMethod === "email" || broadcast.sendingMethod === "all") {
          console.log("Scheduled Broadcast Debug - Sending emails in batches to respect rate limit");
          await processInBatches(recipients, 5, 1000, async (recipient) => {
            console.log("Scheduled Broadcast Debug - Processing recipient:", recipient.email, "Type:", recipient.membershipType);
            console.log("Scheduled Broadcast Debug - Attempting to send email to:", recipient.email);
            
            try {
              await sendEmail({
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
              });
              console.log("Scheduled Broadcast Debug - Email sent successfully to:", recipient.email);
              // Update tracking record to sent
              await BroadcastTracking.updateOne(
                { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "email" },
                { status: "sent", sentAt: new Date() }
              );
            } catch (error) {
              console.error(`Scheduled Broadcast Debug - Failed to send email to ${recipient.email}:`, error);
              // Update tracking record to failed
              await BroadcastTracking.updateOne(
                { broadcast: broadcast._id, recipient: recipient._id, sendingMethod: "email" },
                { status: "failed", errorMessage: error.message }
              );
            }
          });
        }
        
        // Process SMS in batches
        if (broadcast.sendingMethod === "sms" || broadcast.sendingMethod === "all") {
          console.log("Scheduled Broadcast Debug - Sending SMS messages");
          await processInBatches(recipients, 5, 1000, async (recipient) => {
            if (recipient.phone) {
              try {
                await sendSMS({
                  to: recipient.phone,
                  body: `${broadcast.subject}\n\n${broadcast.content}\n\n- Pashupatinath Norway Temple`
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
        if (broadcast.sendingMethod === "message" || broadcast.sendingMethod === "all") {
          console.log("Scheduled Broadcast Debug - Sending internal messages");
          await processInBatches(recipients, 10, 500, async (recipient) => {
            try {
              await sendInternalMessage({
                recipient: recipient._id,
                senderEmail: broadcast.sender.email,
                subject: broadcast.subject,
                content: broadcast.content,
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

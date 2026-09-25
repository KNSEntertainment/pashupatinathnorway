import { NextResponse } from "next/server";
import { Broadcast, BroadcastTracking } from "@/models/Broadcast.Model";
import { sendSMS } from "@/lib/sms";
import { sendInternalMessage } from "@/lib/internalMessages";
import connectDB from "@/lib/mongodb";
import { processBroadcastEmailChunk, getBroadcastEmailsSentToday, DAILY_BROADCAST_EMAIL_LIMIT, CHUNK_SIZE_PER_INVOCATION, syncBroadcastProgress } from "@/lib/broadcastQueue";

export const maxDuration = 60; // Allow up to 60s for serverless execution

export async function GET(request) {
	try {
		await connectDB();

		const url = new URL(request.url);
		const customLimit = parseInt(url.searchParams.get("limit")) || CHUNK_SIZE_PER_INVOCATION;
		const targetBroadcastId = url.searchParams.get("broadcastId") || null;

		console.log("Cron: Processing scheduled/in-progress broadcasts...");

		const now = new Date();

		// 1. Activate any scheduled broadcasts that are due
		const scheduledDue = await Broadcast.find({
			status: "pending",
			$or: [{ scheduledFor: { $lte: now } }, { scheduledFor: null }],
		});

		for (const b of scheduledDue) {
			b.status = "sending";
			await b.save();
			console.log(`Activated scheduled broadcast: "${b.subject}" (_id: ${b._id})`);
		}

		// 2. Process any pending SMS messages for active broadcasts (limit 20 per run)
		const pendingSMS = await BroadcastTracking.find({
			status: "pending",
			sendingMethod: "sms",
		})
			.populate("recipient", "phone firstName")
			.populate("broadcast", "subject content")
			.limit(20);

		let smsProcessed = 0;
		for (const smsTrack of pendingSMS) {
			if (smsTrack.recipient?.phone) {
				try {
					await sendSMS({
						to: smsTrack.recipient.phone,
						body: `${smsTrack.broadcast.subject}\n\n${smsTrack.broadcast.content}\n\n- Pashupatinath Norway Temple`,
					});
					smsTrack.status = "sent";
					smsTrack.sentAt = new Date();
				} catch (err) {
					console.error(`Failed to send SMS to ${smsTrack.recipient.phone}:`, err);
					smsTrack.status = "failed";
					smsTrack.errorMessage = err.message;
				}
			} else {
				smsTrack.status = "failed";
				smsTrack.errorMessage = "No valid phone number";
			}
			await smsTrack.save();
			smsProcessed++;
		}

		// 3. Process any pending internal messages for active broadcasts (limit 30 per run)
		const pendingMessages = await BroadcastTracking.find({
			status: "pending",
			sendingMethod: "message",
		})
			.populate("broadcast", "subject content sender attachment attachmentName")
			.limit(30);

		let messagesProcessed = 0;
		for (const msgTrack of pendingMessages) {
			try {
				await sendInternalMessage({
					recipient: msgTrack.recipient,
					senderEmail: "admin@pashupatinath.no",
					subject: msgTrack.broadcast.subject,
					content: msgTrack.broadcast.content,
					relatedBroadcast: msgTrack.broadcast._id,
					attachment: msgTrack.broadcast.attachment || null,
					attachmentName: msgTrack.broadcast.attachmentName || null,
				});
				msgTrack.status = "sent";
				msgTrack.sentAt = new Date();
			} catch (err) {
				console.error(`Failed to send internal message to ${msgTrack.recipient}:`, err);
				msgTrack.status = "failed";
				msgTrack.errorMessage = err.message;
			}
			await msgTrack.save();
			messagesProcessed++;
		}

		// 4. Process email chunk strictly abiding by the 80/day limit
		const emailResult = await processBroadcastEmailChunk({
			maxEmails: customLimit,
			broadcastId: targetBroadcastId,
		});

		// 5. Check if any active broadcasts can now be marked complete
		const activeBroadcasts = await Broadcast.find({ status: "sending" });
		for (const b of activeBroadcasts) {
			await syncBroadcastProgress(b._id);
		}

		const sentToday = await getBroadcastEmailsSentToday();

		return NextResponse.json({
			success: true,
			timestamp: new Date().toISOString(),
			dailyQuota: {
				sentToday,
				dailyLimit: DAILY_BROADCAST_EMAIL_LIMIT,
				remainingToday: Math.max(0, DAILY_BROADCAST_EMAIL_LIMIT - sentToday),
			},
			emailResult,
			smsProcessed,
			messagesProcessed,
		});
	} catch (error) {
		console.error("Error in process-scheduled route:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to process broadcasts",
				details: error.message,
			},
			{ status: 500 },
		);
	}
}

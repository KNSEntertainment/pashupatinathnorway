import { Broadcast, BroadcastTracking } from "@/models/Broadcast.Model";
import { sendEmail } from "@/lib/email";
import connectDB from "@/lib/mongodb";

// Free tier Resend daily allocation:
// 100 emails/day total limit on Resend
// 80 emails/day allocated to bulk broadcast queue
// 20 emails/day safely reserved for transactional emails (OTP, password reset, welcome, birthday wishes)
export const DAILY_BROADCAST_EMAIL_LIMIT = 80;

// Maximum emails to process in a single serverless invocation
// 20 emails * ~600ms = ~12s execution time (well under Vercel serverless timeout)
export const CHUNK_SIZE_PER_INVOCATION = 20;

// Delay between individual email dispatches to strictly stay under Resend's 2 req/sec rate limit
export const DELAY_BETWEEN_EMAILS_MS = 600;

/**
 * Get start of current day in UTC (Resend's quota resets at 00:00 UTC)
 */
export function getStartOfTodayUTC() {
	const now = new Date();
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Calculate the timestamp when the daily quota next resets (next 00:00 UTC)
 */
export function getNextDailyResetUTC() {
	const now = new Date();
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
}

/**
 * Count how many broadcast emails have been successfully sent today (since 00:00 UTC)
 */
export async function getBroadcastEmailsSentToday() {
	await connectDB();
	const startOfToday = getStartOfTodayUTC();
	return await BroadcastTracking.countDocuments({
		sendingMethod: "email",
		status: "sent",
		sentAt: { $gte: startOfToday },
	});
}

/**
 * Get remaining broadcast email quota for today
 */
export async function getRemainingEmailQuotaToday() {
	const sentToday = await getBroadcastEmailsSentToday();
	return Math.max(0, DAILY_BROADCAST_EMAIL_LIMIT - sentToday);
}

/**
 * Recalculate and update progress on a single Broadcast document
 */
export async function syncBroadcastProgress(broadcastId) {
	await connectDB();
	const tracking = await BroadcastTracking.find({ broadcast: broadcastId, sendingMethod: "email" });
	if (!tracking || tracking.length === 0) return null;

	const total = tracking.length;
	const sent = tracking.filter((t) => t.status === "sent").length;
	const failed = tracking.filter((t) => t.status === "failed").length;
	const pending = tracking.filter((t) => t.status === "pending").length;

	const updateData = {
		"batchProgress.totalRecipients": total,
		"batchProgress.sentCount": sent,
		"batchProgress.failedCount": failed,
		"batchProgress.pendingCount": pending,
		"batchProgress.dailyLimit": DAILY_BROADCAST_EMAIL_LIMIT,
		updatedAt: new Date(),
	};

	// If no more pending recipients, mark broadcast as completely sent
	if (pending === 0 && total > 0) {
		updateData.status = "sent";
		updateData.sentAt = new Date();
	}

	return await Broadcast.findByIdAndUpdate(broadcastId, { $set: updateData }, { new: true });
}

/**
 * Process a chunk of pending broadcast emails, strictly obeying the daily quota and rate limits.
 *
 * @param {Object} options
 * @param {number} [options.maxEmails=CHUNK_SIZE_PER_INVOCATION] - Maximum emails to process in this run
 * @param {string} [options.broadcastId=null] - Optional specific broadcast ID to process
 * @returns {Promise<Object>} Execution report
 */
export async function processBroadcastEmailChunk({ maxEmails = CHUNK_SIZE_PER_INVOCATION, broadcastId = null } = {}) {
	await connectDB();

	const sentToday = await getBroadcastEmailsSentToday();
	const remainingQuota = Math.max(0, DAILY_BROADCAST_EMAIL_LIMIT - sentToday);

	if (remainingQuota <= 0) {
		return {
			success: true,
			processed: 0,
			successful: 0,
			failed: 0,
			sentToday,
			remainingQuota: 0,
			dailyLimit: DAILY_BROADCAST_EMAIL_LIMIT,
			quotaExceeded: true,
			nextReset: getNextDailyResetUTC().toISOString(),
			message: `Daily broadcast quota of ${DAILY_BROADCAST_EMAIL_LIMIT} emails reached today. Next batch will run automatically after 00:00 UTC.`,
		};
	}

	// Cap number of emails to remaining quota and maxEmails limit
	const limit = Math.min(maxEmails, remainingQuota);

	// Build query to find broadcasts eligible for email sending
	let targetBroadcastIds = [];
	if (broadcastId) {
		targetBroadcastIds = [broadcastId];
	} else {
		const now = new Date();
		// Eligible broadcasts: in "sending" state or scheduled broadcasts ready to send
		const eligibleBroadcasts = await Broadcast.find({
			$or: [{ status: "sending" }, { status: "pending", scheduledFor: { $lte: now } }, { status: "pending", scheduledFor: null }],
			sendingMethod: { $in: ["email", "all"] },
		})
			.sort({ createdAt: 1 })
			.select("_id status");

		targetBroadcastIds = eligibleBroadcasts.map((b) => b._id);
	}

	if (targetBroadcastIds.length === 0) {
		return {
			success: true,
			processed: 0,
			successful: 0,
			failed: 0,
			sentToday,
			remainingQuota,
			dailyLimit: DAILY_BROADCAST_EMAIL_LIMIT,
			quotaExceeded: false,
			message: "No pending broadcast emails to process.",
		};
	}

	// Ensure these broadcasts are marked as "sending"
	await Broadcast.updateMany({ _id: { $in: targetBroadcastIds }, status: "pending" }, { $set: { status: "sending" } });

	// Fetch up to `limit` pending email tracking records (FIFO)
	const pendingTracks = await BroadcastTracking.find({
		broadcast: { $in: targetBroadcastIds },
		sendingMethod: "email",
		status: "pending",
	})
		.populate("recipient", "firstName lastName email")
		.populate("broadcast", "subject content sender attachment attachmentName")
		.sort({ createdAt: 1 })
		.limit(limit);

	if (pendingTracks.length === 0) {
		// Check if any of these broadcasts are now finished
		for (const bId of targetBroadcastIds) {
			await syncBroadcastProgress(bId);
		}
		return {
			success: true,
			processed: 0,
			successful: 0,
			failed: 0,
			sentToday,
			remainingQuota,
			dailyLimit: DAILY_BROADCAST_EMAIL_LIMIT,
			quotaExceeded: false,
			message: "No pending recipients found for active broadcasts.",
		};
	}

	let successful = 0;
	let failed = 0;
	const touchedBroadcastIds = new Set();
	let quotaHitDuringRun = false;

	for (let i = 0; i < pendingTracks.length; i++) {
		const track = pendingTracks[i];
		touchedBroadcastIds.add(track.broadcast._id.toString());

		const recipientEmail = track.recipient?.email;
		const recipientName = track.recipient ? `${track.recipient.firstName || ""} ${track.recipient.lastName || ""}`.trim() : "Community Member";

		if (!recipientEmail) {
			track.status = "failed";
			track.errorMessage = "No valid email address found for recipient";
			await track.save();
			failed++;
			continue;
		}

		try {
			const subject = track.broadcast.subject;
			const content = track.broadcast.content;
			const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #d4418e; border-bottom: 2px solid #ff6b6b; padding-bottom: 10px;">${subject}</h2>
          <div style="line-height: 1.7; font-size: 15px; margin: 20px 0;">${content.replace(/\n/g, "<br>")}</div>
          ${
						track.broadcast.attachment
							? `<div style="margin: 20px 0; padding: 12px; background: #fdf2f8; border: 1px dashed #f472b6; border-radius: 8px;">
                  <p style="margin: 0; font-size: 14px;">📎 <strong>Attachment:</strong> <a href="${track.broadcast.attachment}" target="_blank" rel="noopener noreferrer" style="color: #d4418e; text-decoration: underline;">${track.broadcast.attachmentName || "View Attachment"}</a></p>
                </div>`
							: ""
					}
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #888; font-size: 12px; line-height: 1.5;">
            This email was sent to ${recipientName} (${recipientEmail}) by the Pashupatinath Norway administration.<br>
            Pashupatinath Temple Norway, Postboks 123, Oslo, Norway
          </p>
        </div>
      `;

			await sendEmail({
				to: recipientEmail,
				subject,
				text: content,
				html,
			});

			track.status = "sent";
			track.sentAt = new Date();
			track.errorMessage = null;
			await track.save();
			successful++;
		} catch (err) {
			console.error(`Broadcast Queue - Failed sending to ${recipientEmail}:`, err);
			track.status = "failed";
			track.errorMessage = err.message || "Email dispatch failed";
			await track.save();
			failed++;

			// If Resend throws quota exceeded, stop dispatching immediately
			const errMsg = (err.message || "").toLowerCase();
			if (errMsg.includes("quota") || errMsg.includes("rate_limit") || errMsg.includes("limit")) {
				console.warn("Resend limit reached during chunk processing. Halting batch.");
				quotaHitDuringRun = true;
				break;
			}
		}

		// Rate limiting delay between emails to strictly respect Resend's 2 req/sec limit
		if (i < pendingTracks.length - 1 && !quotaHitDuringRun) {
			await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_EMAILS_MS));
		}
	}

	// Sync progress for all broadcasts touched during this run
	for (const bId of touchedBroadcastIds) {
		await syncBroadcastProgress(bId);
	}

	const updatedSentToday = await getBroadcastEmailsSentToday();
	const updatedRemaining = Math.max(0, DAILY_BROADCAST_EMAIL_LIMIT - updatedSentToday);

	return {
		success: true,
		processed: successful + failed,
		successful,
		failed,
		sentToday: updatedSentToday,
		remainingQuota: updatedRemaining,
		dailyLimit: DAILY_BROADCAST_EMAIL_LIMIT,
		quotaExceeded: updatedRemaining <= 0 || quotaHitDuringRun,
		nextReset: getNextDailyResetUTC().toISOString(),
		message: `Processed ${successful + failed} emails (${successful} sent, ${failed} failed). Remaining quota today: ${updatedRemaining}/${DAILY_BROADCAST_EMAIL_LIMIT}.`,
	};
}

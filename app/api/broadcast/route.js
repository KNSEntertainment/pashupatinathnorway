import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { Broadcast, BroadcastTracking } from "@/models/Broadcast.Model";
import Membership from "@/models/Membership.Model";
import { sendSMS } from "@/lib/sms";
import { sendInternalMessage } from "@/lib/internalMessages";
import connectDB from "@/lib/mongodb";
import { processBroadcastEmailChunk, getBroadcastEmailsSentToday, syncBroadcastProgress, DAILY_BROADCAST_EMAIL_LIMIT } from "@/lib/broadcastQueue";

export const maxDuration = 60;

// GET all broadcasts with daily quota info
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
		const sentToday = await getBroadcastEmailsSentToday();

		return NextResponse.json({
			broadcasts,
			pagination: { page, limit, total, pages: Math.ceil(total / limit) },
			dailyQuota: {
				sentToday,
				dailyLimit: DAILY_BROADCAST_EMAIL_LIMIT,
				remainingToday: Math.max(0, DAILY_BROADCAST_EMAIL_LIMIT - sentToday),
			},
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
		const { subject, content, sendingMethod, recipientType, recipientGroups, individualRecipients, scheduledFor, attachment, attachmentName } = body;

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
				membershipType: { $in: recipientGroups },
			});
		} else if (recipientType === "individual") {
			recipients = await Membership.find({
				_id: { $in: individualRecipients },
				membershipStatus: "approved",
			});
		}

		if (recipients.length === 0) {
			return NextResponse.json({ error: "No valid recipients found" }, { status: 400 });
		}

		// Create broadcast document with initial batchProgress
		const isScheduled = !!scheduledFor && new Date(scheduledFor) > new Date();
		const broadcast = new Broadcast({
			subject,
			content,
			sender: session.user.id,
			sendingMethod,
			recipientType,
			recipientGroups: recipientGroups || [],
			individualRecipients: individualRecipients || [],
			scheduledFor: isScheduled ? new Date(scheduledFor) : null,
			status: isScheduled ? "pending" : "sending",
			attachment: attachment || null,
			attachmentName: attachmentName || null,
			batchProgress: {
				totalRecipients: recipients.length,
				sentCount: 0,
				failedCount: 0,
				pendingCount: recipients.length,
				dailyLimit: DAILY_BROADCAST_EMAIL_LIMIT,
				lastBatchSentAt: null,
			},
		});

		await broadcast.save();

		// Create tracking records for each recipient
		const trackingRecords = [];
		for (const recipient of recipients) {
			if (sendingMethod === "all") {
				["email", "sms", "message"].forEach((method) => {
					trackingRecords.push({
						broadcast: broadcast._id,
						recipient: recipient._id,
						sendingMethod: method,
						status: "pending",
					});
				});
			} else {
				trackingRecords.push({
					broadcast: broadcast._id,
					recipient: recipient._id,
					sendingMethod,
					status: "pending",
				});
			}
		}

		await BroadcastTracking.insertMany(trackingRecords);

		// If not scheduled, dispatch initial batch
		let initialMessage = "Broadcast scheduled successfully";
		if (!isScheduled) {
			// 1. Process SMS if selected (up to 20 immediately)
			if (sendingMethod === "sms" || sendingMethod === "all") {
				const smsRecipients = recipients.filter((r) => r.phone).slice(0, 20);
				for (const r of smsRecipients) {
					try {
						await sendSMS({
							to: r.phone,
							body: `${subject}\n\n${content}\n\n- Pashupatinath Norway Temple`,
						});
						await BroadcastTracking.updateOne({ broadcast: broadcast._id, recipient: r._id, sendingMethod: "sms" }, { status: "sent", sentAt: new Date() });
					} catch (err) {
						console.error(`SMS send error to ${r.phone}:`, err);
						await BroadcastTracking.updateOne({ broadcast: broadcast._id, recipient: r._id, sendingMethod: "sms" }, { status: "failed", errorMessage: err.message });
					}
				}
			}

			// 2. Process internal messages if selected (up to 30 immediately)
			if (sendingMethod === "message" || sendingMethod === "all") {
				const msgRecipients = recipients.slice(0, 30);
				for (const r of msgRecipients) {
					try {
						await sendInternalMessage({
							recipient: r._id,
							senderEmail: session.user.email || "admin@pashupatinath.no",
							subject,
							content,
							relatedBroadcast: broadcast._id,
							attachment: attachment || null,
							attachmentName: attachmentName || null,
						});
						await BroadcastTracking.updateOne({ broadcast: broadcast._id, recipient: r._id, sendingMethod: "message" }, { status: "sent", sentAt: new Date() });
					} catch (err) {
						console.error(`Internal message error to ${r._id}:`, err);
						await BroadcastTracking.updateOne({ broadcast: broadcast._id, recipient: r._id, sendingMethod: "message" }, { status: "failed", errorMessage: err.message });
					}
				}
			}

			// 3. Process email initial batch (up to 10 immediately to keep response responsive)
			if (sendingMethod === "email" || sendingMethod === "all") {
				const chunkResult = await processBroadcastEmailChunk({
					maxEmails: 10,
					broadcastId: broadcast._id,
				});

				await syncBroadcastProgress(broadcast._id);
				const updatedBroadcast = await Broadcast.findById(broadcast._id);

				if (updatedBroadcast.status === "sent") {
					initialMessage = `All ${recipients.length} emails sent successfully!`;
				} else if (chunkResult.quotaExceeded) {
					initialMessage = `Broadcast created! Today's 80-email quota has been reached. Remaining emails will be delivered automatically tomorrow after 00:00 UTC.`;
				} else {
					initialMessage = `Broadcast created! Sent initial ${chunkResult.successful} emails. The remaining emails will continue automatically via the daily queue (up to 80/day to reserve quota for website OTP & transactional emails).`;
				}
			} else {
				await syncBroadcastProgress(broadcast._id);
				initialMessage = "Broadcast created and dispatched successfully!";
			}
		}

		const latestBroadcast = await Broadcast.findById(broadcast._id);

		return NextResponse.json(
			{
				message: initialMessage,
				broadcast: latestBroadcast,
				recipientCount: recipients.length,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating broadcast:", error);
		return NextResponse.json({ error: "Failed to create broadcast" }, { status: 500 });
	}
}

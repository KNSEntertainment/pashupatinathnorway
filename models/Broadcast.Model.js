import mongoose from "mongoose";

const BroadcastSchema = new mongoose.Schema({
	subject: { type: String, required: true },
	content: { type: String, required: true },
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	sendingMethod: {
		type: String,
		enum: ["email", "sms", "message", "all"],
		required: true,
	},
	recipientType: {
		type: String,
		enum: ["individual", "group", "all", "subscribers"],
		required: true,
	},
	recipientGroups: [
		{
			type: String,
			enum: ["General", "Active", "Executive", "Advisor"],
		},
	],
	individualRecipients: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Membership",
		},
	],
	status: {
		type: String,
		enum: ["draft", "pending", "sending", "sent", "failed"],
		default: "draft",
	},
	scheduledFor: { type: Date },
	sentAt: { type: Date },
	attachment: { type: String },
	attachmentName: { type: String },
	batchProgress: {
		totalRecipients: { type: Number, default: 0 },
		sentCount: { type: Number, default: 0 },
		failedCount: { type: Number, default: 0 },
		pendingCount: { type: Number, default: 0 },
		dailyLimit: { type: Number, default: 80 },
		lastBatchSentAt: { type: Date },
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

const BroadcastTrackingSchema = new mongoose.Schema({
	broadcast: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Broadcast",
		required: true,
	},
	recipient: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Membership",
		required: true,
	},
	sendingMethod: {
		type: String,
		enum: ["email", "sms", "message"],
		required: true,
	},
	status: {
		type: String,
		enum: ["pending", "sent", "delivered", "read", "failed"],
		default: "pending",
	},
	sentAt: { type: Date },
	deliveredAt: { type: Date },
	readAt: { type: Date },
	errorMessage: { type: String },
	retryCount: { type: Number, default: 0 },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

BroadcastTrackingSchema.index({ broadcast: 1, sendingMethod: 1, status: 1 });
BroadcastTrackingSchema.index({ sendingMethod: 1, status: 1, sentAt: 1 });

const Broadcast = mongoose.models.Broadcast || mongoose.model("Broadcast", BroadcastSchema);
const BroadcastTracking = mongoose.models.BroadcastTracking || mongoose.model("BroadcastTracking", BroadcastTrackingSchema);

export { Broadcast, BroadcastTracking };
export default Broadcast;

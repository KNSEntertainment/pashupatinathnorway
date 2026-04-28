import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema(
	{
		donorName: {
			type: String,
			required: true,
		},
		donorEmail: {
			type: String,
			required: true,
		},
		donorPhone: {
			type: String,
		},
		amount: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			default: "NOK",
		},
		message: {
			type: String,
		},
		isAnonymous: {
			type: Boolean,
			default: false,
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "completed", "failed", "refunded"],
			default: "pending",
		},
		stripeSessionId: {
			type: String,
		},
		stripePaymentIntentId: {
			type: String,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		causeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Cause",
		},
		donationType: {
			type: String,
			enum: ["general", "cause_specific"],
			default: "general",
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.models.Donation || mongoose.model("Donation", DonationSchema);

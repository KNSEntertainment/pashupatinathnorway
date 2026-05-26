import mongoose from "mongoose";

const IncomeSchema = new mongoose.Schema(
	{
		eventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
		},
		title: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		sourceType: {
			type: String,
			required: true,
			enum: ["donation", "membership", "registration", "sponsorship", "grants", "events", "other"],
		},
		paymentMethod: {
			type: String,
			enum: ["cash", "bank_transfer", "stripe", "vipps", "paypal", "other"],
		},
		referenceId: {
			type: String,
		},
		description: {
			type: String,
		},
		// Keep existing fields for backward compatibility
		source: {
			type: String,
			enum: ["donations", "membership_fees", "events", "sponsorships", "grants", "other"],
		},
		customSource: {
			type: String,
			required: function() {
				return this.source === "other";
			},
		},
		date: {
			type: Date,
			required: true,
			default: Date.now,
		},
		reference: {
			type: String,
		},
		budgetId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Budget",
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Income || mongoose.model("Income", IncomeSchema);

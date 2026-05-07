import mongoose from "mongoose";

const IncomeSchema = new mongoose.Schema(
	{
		amount: {
			type: Number,
			required: true,
		},
		source: {
			type: String,
			required: true,
			enum: ["donations", "membership_fees", "events", "sponsorships", "grants", "other"],
		},
		customSource: {
			type: String,
			required: function() {
				return this.source === "other";
			},
		},
		description: {
			type: String,
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
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Income || mongoose.model("Income", IncomeSchema);

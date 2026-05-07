import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		category: {
			type: String,
			required: true,
			enum: ["rent", "utilities", "salaries", "marketing", "events", "maintenance", "supplies", "insurance", "taxes", "other", "overall"],
		},
		totalAmount: {
			type: Number,
			required: true,
		},
		period: {
			type: String,
			enum: ["monthly", "quarterly", "yearly"],
			default: "monthly",
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ["active", "inactive", "completed"],
			default: "active",
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);

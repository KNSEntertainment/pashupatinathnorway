import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
	{
		amount: {
			type: Number,
			required: true,
		},
		category: {
			type: String,
			required: true,
			enum: ["rent", "utilities", "salaries", "marketing", "events", "maintenance", "supplies", "insurance", "taxes", "other"],
		},
		customCategory: {
			type: String,
			required: function() {
				return this.category === "other";
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
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
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

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

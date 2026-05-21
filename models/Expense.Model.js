import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
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
		expenseCategory: {
			type: String,
			required: true,
			enum: ["food", "venue", "transport", "equipment", "marketing", "maintenance", "other"],
		},
		paymentMethod: {
			type: String,
			enum: ["cash", "bank_transfer", "stripe", "vipps", "paypal", "other"],
		},
		receiptUrl: {
			type: String,
		},
		notes: {
			type: String,
		},
		// Keep existing fields for backward compatibility
		category: {
			type: String,
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

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

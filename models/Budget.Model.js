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
		eventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
			default: null,
		},
		category: {
			type: String,
			required: true,
			enum: ["rent", "utilities", "salaries", "marketing", "events", "maintenance", "supplies", "insurance", "taxes", "other", "overall"],
		},
		// Keep totalAmount for backward compatibility
		totalAmount: {
			type: Number,
			required: true,
		},
		// New field for allocated amount
		allocatedAmount: {
			type: Number,
			required: true,
		},
		spentAmount: {
			type: Number,
			default: 0,
		},
		remainingAmount: {
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
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	}
);

// Pre-save hook to automatically calculate remainingAmount
BudgetSchema.pre('save', function(next) {
	// For backward compatibility, if allocatedAmount is not set, use totalAmount
	if (this.allocatedAmount === undefined || this.allocatedAmount === null) {
		this.allocatedAmount = this.totalAmount;
	}
	
	// Calculate remaining amount
	this.remainingAmount = this.allocatedAmount - this.spentAmount;
	
	next();
});

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);

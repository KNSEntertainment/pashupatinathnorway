import mongoose from "mongoose";

const ManagementHistorySchema = new mongoose.Schema({
	originalMembershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership" },
	firstName: { type: String, required: true },
	middleName: { type: String },
	lastName: { type: String, required: true },
	position: { type: String, required: true },
	membershipType: { type: String, enum: ["Executive", "Advisor"], required: true },
	termStart: { type: Date, required: true },
	termEnd: { type: Date, required: true },
	displayOrder: { type: Number, default: 0 },
	resigned: { type: Boolean, default: false }, // true if this term ended early (resignation) rather than at a board-wide turnover
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ManagementHistory || mongoose.model("ManagementHistory", ManagementHistorySchema);

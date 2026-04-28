import mongoose from "mongoose";

const executiveMemberSchema = new mongoose.Schema({
	name: { type: String, required: true },
	position: { type: String, required: false },
	department: { type: String, required: false },
	subdepartment: { type: String, required: false },
	phone: { type: String, required: true },
	email: { type: String, required: true },
	imageUrl: { type: String, required: false },
	order: { type: Number, default: 0 }, // For sorting members
	isActive: { type: Boolean, default: true },
	createdBy: { type: String, default: "" },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.ExecutiveMember || mongoose.model("ExecutiveMember", executiveMemberSchema);

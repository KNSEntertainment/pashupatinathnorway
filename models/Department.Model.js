import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	subdepartments: [{ type: String }], // Array of subdepartment names
	order: { type: Number, default: 0 },
	isActive: { type: Boolean, default: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Department || mongoose.model("Department", departmentSchema);

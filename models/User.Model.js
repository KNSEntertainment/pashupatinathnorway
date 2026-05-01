import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		userName: { type: String, required: true },
		password: { type: String },
		role: { type: String, enum: ["user", "admin"], required: true },
		phone: { type: String },
		resetToken: { type: String },
		resetTokenExpiry: { type: Date },
		setupToken: { type: String },
		setupTokenExpiry: { type: Date },
		pendingEmail: { type: String }, // For email change verification
		emailVerificationToken: { type: String }, // For email change verification
		emailVerificationTokenExpiry: { type: Date }, // For email change verification
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.User || mongoose.model("User", userSchema);

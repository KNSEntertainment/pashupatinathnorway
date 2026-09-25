import mongoose from "mongoose";

const PhoneOTPSchema = new mongoose.Schema(
	{
		phoneNumber: {
			type: String,
			required: true,
			index: true,
		},
		code: {
			type: String,
			required: true,
		},
		attempts: {
			type: Number,
			default: 0,
		},
		expiresAt: {
			type: Date,
			required: true,
			expires: 0, // MongoDB TTL index: document automatically removed when expired
		},
		verified: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

PhoneOTPSchema.index({ phoneNumber: 1, expiresAt: 1 });

export default mongoose.models.PhoneOTP || mongoose.model("PhoneOTP", PhoneOTPSchema);

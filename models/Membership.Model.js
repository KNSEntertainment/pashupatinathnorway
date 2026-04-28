import mongoose from "mongoose";

const MembershipSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	middleName: { type: String },
	lastName: { type: String, required: true },
	email: { type: String, required: true },
	phone: { type: String, required: true },
	address: { type: String, required: true },
	city: { type: String, required: true },
	postalCode: { type: String, required: true },
	personalNumber: { type: String, required: true, validate: { validator: function(v) { return /^\d{11}$/.test(v); }, message: 'Personal number must be exactly 11 digits' } },
	gender: { type: String, required: true },
	province: { type: String },
	district: { type: String },
	membershipStatus: { type: String, enum: ["blocked", "pending", "approved"], required: true },
	agreeTerms: { type: Boolean, required: true },
	permissionPhotos: { type: Boolean, default: false },
	permissionPhone: { type: Boolean, default: false },
	permissionEmail: { type: Boolean, default: false },
	profilePhoto: { type: String },
	password: { type: String },
	passwordSetupToken: { type: String },
	passwordSetupTokenExpiry: { type: Date },
	passwordResetToken: { type: String },
	passwordResetTokenExpiry: { type: Date },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Membership || mongoose.model("Membership", MembershipSchema);

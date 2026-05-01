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
	kommune: { type: String },
	fylke: { type: String },
	personalNumber: { type: String, required: true, validate: { validator: function(v) { return /^\d{11}$/.test(v); }, message: 'Personal number must be exactly 11 digits' } },
	membershipStatus: { type: String, enum: ["blocked", "pending", "approved"], required: true },
	membershipType: { type: String, enum: ["General", "Active"], default: "General" },
	osloVerificationStatus: { type: String, enum: ["pending", "verified", "rejected", "follow_up_needed"], default: "pending" },
	agreeTerms: { type: Boolean, required: false, default: true },
	profilePhoto: { type: String },
	familyMembers: [{
		firstName: { type: String, required: true },
		middleName: { type: String },
		lastName: { type: String, required: true },
		personalNumber: { type: String, required: true, validate: { validator: function(v) { return /^\d{11}$/.test(v); }, message: 'Personal number must be exactly 11 digits' } },
		email: { type: String, required: true },
		phone: { type: String },
	}],
	password: { type: String },
	passwordSetupToken: { type: String },
	passwordSetupTokenExpiry: { type: Date },
	passwordResetToken: { type: String },
	passwordResetTokenExpiry: { type: Date },
	pendingEmail: { type: String }, // For email change verification
	emailVerificationToken: { type: String }, // For email change verification
	emailVerificationTokenExpiry: { type: Date }, // For email change verification
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Membership || mongoose.model("Membership", MembershipSchema);

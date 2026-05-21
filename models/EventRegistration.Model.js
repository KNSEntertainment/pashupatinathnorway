import mongoose from "mongoose";

const EventRegistrationSchema = new mongoose.Schema(
	{
		eventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
			required: true,
		},
		registrationType: {
			type: String,
			enum: ["member", "guest"],
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
		},
		membershipRef: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Membership",
		},
		membershipId: {
			type: String,
		},
		attendeeCount: {
			type: Number,
			default: 1,
		},
		selectedFamilyMembers: [
			{
				name: String,
				relationship: String,
			},
		],
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
		},
		address: {
			type: String,
		},
		donationAmount: {
			type: Number,
			default: 0,
		},
		paymentAmount: {
			type: Number,
			default: 0,
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "completed", "failed", "free"],
			default: "pending",
		},
		registrationStatus: {
			type: String,
			enum: ["registered", "cancelled"],
			default: "registered",
		},
	},
	{
		timestamps: true,
	}
);

// Compound index to prevent duplicate registrations
EventRegistrationSchema.index({ eventId: 1, membershipId: 1 }, { unique: true, sparse: true });
EventRegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true, sparse: true });

export default mongoose.models.EventRegistration || mongoose.model("EventRegistration", EventRegistrationSchema);

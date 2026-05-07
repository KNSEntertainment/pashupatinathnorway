import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema(
	{
		donorName: {
			type: String,
			required: true,
		},
		donorEmail: {
			type: String,
		},
		donorPhone: {
			type: String,
		},
		personalNumber: {
			type: String,
			validate: {
				validator: function(v) {
					// Optional field - can be either plain 11 digits or encrypted format
					if (!v) return true;
					// Check if it's encrypted (format: iv:tag:encrypted)
					const parts = v.split(':');
					if (parts.length === 3) {
						const iv = parts[0];
						const tag = parts[1];
						return iv.length === 32 && tag.length === 32 && /^[0-9a-fA-F]+$/.test(iv + tag);
					}
					// Otherwise check if it's plain 11 digits
					return /^\d{11}$/.test(v);
				},
				message: 'Personal number must be exactly 11 digits or in encrypted format'
			}
		},
		membershipId: {
			type: String,
			validate: {
				validator: function(v) {
					if (!v) return true; // Optional for non-members
					return /^MEM-\d{4}-\d{6}$/.test(v);
				},
				message: 'Invalid membership ID format. Expected format: MEM-YYYY-XXXXXX'
			}
		},
		taxId: {
			type: String,
			validate: {
				validator: function(v) {
					if (!v) return true; // Optional for members
					return /^TAX-\d{4}-\d{6}$/.test(v);
				},
				message: 'Invalid tax ID format. Expected format: TAX-YYYY-XXXXXX'
			}
		},
		address: {
			type: String,
		},
		amount: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			default: "NOK",
		},
		message: {
			type: String,
		},
		isAnonymous: {
			type: Boolean,
			default: false,
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "completed", "failed", "refunded"],
			default: "pending",
		},
		stripeSessionId: {
			type: String,
		},
		stripePaymentIntentId: {
			type: String,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		causeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Cause",
		},
		donationType: {
			type: String,
			enum: ["general", "cause_specific"],
			default: "general",
		},
	},
	{
		timestamps: true,
	},
);

// Virtual field for decrypted personal number
DonationSchema.virtual('decryptedPersonalNumber').get(function() {
	if (!this.personalNumber) return '';
	
	// Import encryption functions dynamically to avoid circular dependencies
	const { decryptPersonalNumber, isEncrypted } = require('../lib/encryption');
	
	// Check if already encrypted
	if (isEncrypted(this.personalNumber)) {
		return decryptPersonalNumber(this.personalNumber);
	}
	
	// Return as-is if plain text (for backward compatibility)
	return this.personalNumber;
});

// Ensure virtual fields are included in JSON output
DonationSchema.set('toJSON', { virtuals: true });
DonationSchema.set('toObject', { virtuals: true });

export default mongoose.models.Donation || mongoose.model("Donation", DonationSchema);

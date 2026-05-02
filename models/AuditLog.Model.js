import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
	{
		action: { type: String, required: true }, // e.g., "bulk_upload_donations"
		user: { 
			id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
			name: { type: String, required: true },
			email: { type: String, required: true },
			role: { type: String, required: true }
		},
		details: {
			totalRows: { type: Number },
			validRows: { type: Number },
			insertedRows: { type: Number },
			skippedRows: { type: Number },
			fileName: { type: String },
			fileSize: { type: Number },
			validationErrors: [{ 
				row: { type: Number }, 
				errorMessages: [{ type: String }] 
			}],
			verifiedCount: { type: Number },
			unverifiedCount: { type: Number },
			verificationFileRows: { type: Number },
			filters: {
				search: { type: String },
				statusFilter: { type: String },
				typeFilter: { type: String }
			},
			personalNumber: { type: String },
			year: { type: Number },
			memberName: { type: String },
			totalDonated: { type: Number },
			donationCount: { type: Number },
			membershipStatus: { type: String },
			eventId: { type: String },
			eventName: { type: String },
			eventDate: { type: String },
			recordCount: { type: Number }
		},
		ipAddress: { type: String },
		userAgent: { type: String },
		timestamp: { type: Date, default: Date.now },
		status: { 
			type: String, 
			enum: ["initiated", "completed", "failed", "partial_success"], 
			required: true,
			default: "initiated"
		},
		errorMessage: { type: String }
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
	eventname: { type: String, required: true },
	eventdescription: { type: String, required: false },
	eventvenue: { type: String, required: false },
	eventdate: { type: String, required: false },
	eventtime: { type: String, required: false },
	eventposterUrl: { type: String, required: true },
	// Festival linkage
	festivalId: { type: mongoose.Schema.Types.ObjectId, ref: "Festivals", default: null }, // Direct reference to festival
	// New fields for registration and pricing
	memberPrice: { type: Number, default: 0 },
	guestPrice: { type: Number, default: 0 },
	allowGuestRegistration: { type: Boolean, default: true },
	registrationDeadline: { type: Date },
	// New fields for attendance tracking
	enableAttendance: { type: Boolean, default: false },
	attendanceStatus: { type: String, enum: ["not_started", "active", "closed"], default: "not_started" },
	maxAttendees: { type: Number },
	createdBy: { type: String }, // User ID who created the event (optional for backward compatibility)
	updatedAt: { type: Date, default: Date.now },
	createdAt: { type: Date, default: Date.now },
});

// Clear the model cache to ensure schema changes take effect
if (mongoose.models.Event) {
  delete mongoose.models.Event;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.Event) {
  delete mongoose.modelSchemas.Event;
}

export default mongoose.model("Event", eventSchema);

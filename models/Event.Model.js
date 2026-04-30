import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
	eventname: { type: String, required: true },
	eventdescription: { type: String, required: false },
	eventvenue: { type: String, required: false },
	eventdate: { type: String, required: false },
	eventtime: { type: String, required: false },
	eventposterUrl: { type: String, required: true },
	eventposter2Url: { type: String, required: false },
	eventposter3Url: { type: String, required: false },
	eventvideoUrl: { type: String, required: false },
	// New fields for attendance tracking
	enableAttendance: { type: Boolean, default: false },
	attendanceStatus: { type: String, enum: ["not_started", "active", "closed"], default: "not_started" },
	maxAttendees: { type: Number },
	createdBy: { type: String }, // User ID who created the event (optional for backward compatibility)
	updatedAt: { type: Date, default: Date.now },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Event || mongoose.model("Event", eventSchema);

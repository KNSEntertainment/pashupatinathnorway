import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', required: true },
  memberPersonalNumber: { type: String, required: true },
  memberName: { type: String, required: true },
  memberEmail: { type: String, required: true },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  markedBy: { type: String, required: true }, // User ID who marked attendance
  scannerName: { type: String }, // Name of the person who scanned (for display)
  scannerRole: { type: String }, // Role of the scanner (admin, volunteer, etc.)
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Add compound index to prevent duplicate attendance records
AttendanceSchema.index({ eventId: 1, memberId: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);

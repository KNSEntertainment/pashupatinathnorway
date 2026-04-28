import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: false,
    trim: true,
  },
  interests: {
    type: [String],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "contacted", "active", "inactive"],
    default: "pending",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: "",
  },
});

// Index for better query performance
volunteerSchema.index({ email: 1 });
volunteerSchema.index({ status: 1 });
volunteerSchema.index({ submittedAt: -1 });

const Volunteer = mongoose.models.Volunteer || mongoose.model("Volunteer", volunteerSchema);

export default Volunteer;

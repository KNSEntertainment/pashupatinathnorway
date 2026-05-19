import mongoose from "mongoose";

const BoardMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  type: { type: String, enum: ["executive", "member", "advisor"], required: true },
  membershipId: { type: String },
  email: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

BoardMemberSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.BoardMember || mongoose.model("BoardMember", BoardMemberSchema);

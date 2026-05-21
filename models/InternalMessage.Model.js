import mongoose from "mongoose";

const InternalMessageSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership",
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["broadcast", "personal", "system", "reply"],
    default: "broadcast"
  },
  relatedBroadcast: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Broadcast"
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternalMessage"
  },
  threadMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternalMessage"
  }],
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent"
  },
  readAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
InternalMessageSchema.index({ recipient: 1, isDeleted: 1, createdAt: -1 });
InternalMessageSchema.index({ recipient: 1, status: 1, isDeleted: 1 });
InternalMessageSchema.index({ parentMessage: 1 });
InternalMessageSchema.index({ threadMessages: 1 });

// Update the updatedAt field on save
InternalMessageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const InternalMessage = mongoose.models.InternalMessage || mongoose.model("InternalMessage", InternalMessageSchema);

export { InternalMessage };
export default InternalMessage;

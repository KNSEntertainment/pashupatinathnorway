const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  personalNumber: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  purpose: {
    type: String,
    required: true,
    enum: ['membership-lookup'],
    default: 'membership-lookup'
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
verificationCodeSchema.index({ email: 1, personalNumber: 1, purpose: 1 });
verificationCodeSchema.index({ expiresAt: 1 });

// Method to check if code is expired
verificationCodeSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt.getTime();
};

// Method to check if attempts exceeded
verificationCodeSchema.methods.isAttemptsExceeded = function() {
  return this.attempts >= 5;
};

// Static method to cleanup expired codes
verificationCodeSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Pre-save hook to ensure code is 6 digits
verificationCodeSchema.pre('save', function(next) {
  if (this.code && this.code.length !== 6) {
    return next(new Error('Verification code must be exactly 6 digits'));
  }
  next();
});

const VerificationCode = mongoose.models.VerificationCode || mongoose.model('VerificationCode', verificationCodeSchema);

module.exports = VerificationCode;

const mongoose = require('mongoose');

const privacyPolicySchema = new mongoose.Schema({
  content: {
    type: mongoose.Schema.Types.Mixed, // Allows nested objects and strings
    required: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create or update privacy policy content
privacyPolicySchema.statics.upsertPrivacyPolicy = async function(content, modifiedBy) {
  const privacyPolicy = await this.findOne();
  
  if (privacyPolicy) {
    privacyPolicy.content = content;
    privacyPolicy.modifiedBy = modifiedBy;
    privacyPolicy.lastModified = new Date();
    return await privacyPolicy.save();
  } else {
    return await this.create({
      content,
      modifiedBy
    });
  }
};

// Get current privacy policy content
privacyPolicySchema.statics.getCurrentPrivacyPolicy = async function() {
  const privacyPolicy = await this.findOne();
  return privacyPolicy ? privacyPolicy.content : null;
};

module.exports = mongoose.models.PrivacyPolicy || mongoose.model('PrivacyPolicy', privacyPolicySchema);

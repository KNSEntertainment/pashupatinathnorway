const mongoose = require('mongoose');

const termsSchema = new mongoose.Schema({
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

// Create or update terms content
termsSchema.statics.upsertTerms = async function(content, modifiedBy) {
  const terms = await this.findOne();
  
  if (terms) {
    terms.content = content;
    terms.modifiedBy = modifiedBy;
    terms.lastModified = new Date();
    return await terms.save();
  } else {
    return await this.create({
      content,
      modifiedBy
    });
  }
};

// Get current terms content
termsSchema.statics.getCurrentTerms = async function() {
  const terms = await this.findOne();
  return terms ? terms.content : null;
};

module.exports = mongoose.models.Terms || mongoose.model('Terms', termsSchema);

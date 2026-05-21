const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
    publishedDate: {
    type: Date,
    default: Date.now
  },
  downloadUrl: {
    type: String,
    default: ""
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'ne', 'no'],
    default: 'en'
  },
  accessLevels: [{
    type: String,
    enum: ['all', 'executives', 'advisors', 'active_members', 'general_members']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better performance
publicationSchema.index({ type: 1 });
publicationSchema.index({ language: 1 });
publicationSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.models.Publication || mongoose.model('Publication', publicationSchema);

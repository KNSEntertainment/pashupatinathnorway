const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['financial', 'activity', 'membership', 'audit']
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
  previewUrl: {
    type: String,
    default: ""
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'ne', 'no'],
    default: 'en'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better performance
publicationSchema.index({ year: 1 });
publicationSchema.index({ type: 1 });
publicationSchema.index({ language: 1 });
publicationSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.models.Publication || mongoose.model('Publication', publicationSchema);

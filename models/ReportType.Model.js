const mongoose = require('mongoose');

const reportTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: 'gray',
    enum: ['gray', 'green', 'blue', 'purple', 'orange', 'red', 'yellow', 'pink', 'indigo']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
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
reportTypeSchema.index({ isActive: 1 });
reportTypeSchema.index({ sortOrder: 1 });

module.exports = mongoose.models.ReportType || mongoose.model('ReportType', reportTypeSchema);

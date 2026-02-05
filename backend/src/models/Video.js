const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'processed', 'failed'],
    default: 'pending',
  },
  sensitivity: {
    type: String,
    enum: ['safe', 'flagged', 'unknown'],
    default: 'unknown',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Video', videoSchema);
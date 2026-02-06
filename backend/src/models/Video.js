const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  path: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'processed', 'failed'],
    default: 'pending'
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sensitivity: { type: String, default: 'safe' },
  isShared: { type: Boolean, default: false }, // ← NEW FIELD
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', videoSchema);
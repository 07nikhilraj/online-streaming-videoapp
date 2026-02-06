const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  path: { type: String, required: true },
  s3Key: { type: String }, // S3 object key for deletion
  status: { 
    type: String, 
    enum: ['pending', 'analyzing', 'processing', 'ready', 'failed'],
    default: 'pending'
  },
  size: {
    type: String,
    required: true
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sensitivity: {type: String, enum: ['unknown', 'clean', 'flagged'], default: 'unknown'},
  isShared: { type: Boolean, default: false }, 
  allowedViewers: [{ type: String, default:[] }],
  createdAt: { type: Date, default: Date.now },
  // Add to Video Schema
  organizationId: { 
    type: String, 
    required: true, 
    index: true 
  }
});

module.exports = mongoose.model('Video', videoSchema);
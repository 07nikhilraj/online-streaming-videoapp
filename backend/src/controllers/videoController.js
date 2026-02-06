// backend/src/controllers/videoController.js
const Video = require('../models/Video');
const AuditLog = require('../models/Log');
const { processVideo } = require('../services/videoProcessing');
const { uploadToS3 } = require('../services/s3Service');

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });

    // Upload to S3
    const s3Upload = await uploadToS3(req.file.buffer, req.file.originalname);

    const video = new Video({
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      filename: s3Upload.filename,
      originalName: req.file.originalname,
      path: s3Upload.url, // Store S3 URL instead of local path
      s3Key: s3Upload.key, // Store S3 key for deletion later
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      organizationId: req.user.organizationId,
      status: 'pending',
    });

    await video.save();

    await AuditLog.create({
      action: 'VIDEO_UPLOAD',
      performedBy: req.user._id,
      targetId: video._id,
      organizationId: req.user.organizationId,
      details: `Uploaded: "${video.title}"`
    });

    // Pass Socket.io to the processor
    const io = req.app.get('io');
    processVideo(video._id, io);

    res.status(201).json({
      message: 'Upload successful, processing started',
      video: { id: video._id, status: 'pending' }
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload Controller Error: ' + err.message });
  }
};

module.exports = { uploadVideo };
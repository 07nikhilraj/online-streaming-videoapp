const Video = require('../models/Video');
const AuditLog = require('../models/AuditLog');

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    // 1. Create and Save the Video
    const video = new Video({
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      status: 'pending',
      organizationId: req.user.organizationId,
    });

    await video.save();

    // 2. Create Audit Log 
    // FIXED: Changed 'newVideo' to 'video'
    const auditlog = new AuditLog({
      action: 'VIDEO_UPLOAD',
      performedBy: req.user._id,
      targetId: video._id, 
      details: `Uploaded new video: "${video.title}"`
    });

    await auditlog.save();

    // 3. Start Processing
    const io = req.app.get('io');
    const { simulateProcessing } = require('../services/videoProcessing');

    simulateProcessing(video._id, io);

    // 4. Send Success Response
    res.status(201).json({
      message: 'Video uploaded successfully (processing started)',
      video: {
        id: video._id,
        title: video.title,
        originalName: video.originalName,
        status: video.status,
      },
    });
  } catch (err) {
    console.error("Upload Controller Error:", err); // This will now show you the exact error in your console
    res.status(500).json({ message: 'Error uploading video' });
  }
};

module.exports = { uploadVideo };
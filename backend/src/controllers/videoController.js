const Video = require('../models/Video');

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

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
    });

    await video.save();

    const io = req.app.get('io');
    const { simulateProcessing } = require('../services/videoProcessing');

    simulateProcessing(video._id, io);

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
    console.error(err);
    res.status(500).json({ message: 'Error uploading video' });
  }
};

module.exports = { uploadVideo };
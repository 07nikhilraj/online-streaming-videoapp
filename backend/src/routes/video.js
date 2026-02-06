const express = require('express');
const upload = require('../utils/multerConfig');
const { uploadVideo } = require('../controllers/videoController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const Video = require('../models/Video');

const router = express.Router();

router.post(
  '/upload',
  protect,
  restrictTo('editor', 'admin'),
  upload.single('video'),     // 'video' = field name in form
  uploadVideo
);

router.get('/my-videos', protect, async (req, res) => {
  try {
    const videos = await Video.find({ uploadedBy: req.user._id })
      .select('title originalName filename path size status sensitivity uploadedBy createdAt')
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(videos);
  } catch (err) {
    console.error('Error fetching my videos:', err);
    res.status(500).json({ message: 'Server error fetching videos' });
  }
});

// Delete video (only owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Only owner or admin can delete
    if (video.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    // Delete file from disk (optional – if you want to remove file)
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(video.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Video.findByIdAndDelete(req.params.id);

    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting video' });
  }
});

// Get ALL videos (for viewers & admin)
router.get('/all', protect, async (req, res) => {
  try {
    // Everyone authenticated can see all (no ownership check)
    const videos = await Video.find()
      .select('title originalName filename mimeType status sensitivity uploadedBy createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(videos);
  } catch (err) {
    console.error('Error fetching all videos:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle share status (only owner)
router.patch('/:id/share', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    video.isShared = !video.isShared; // toggle
    await video.save();

    res.json({ message: 'Share status updated', isShared: video.isShared });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update title & description (only owner)
router.patch('/:id', protect, async (req, res) => {
  try {
    const { title, description } = req.body;
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    await video.save();

    res.json({ message: 'Video updated', video });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shared videos (for viewers)
router.get('/shared-videos', protect, async (req, res) => {
  try {
    const videos = await Video.find({ isShared: true })
      .select('title originalName filename mimeType status sensitivity uploadedBy createdAt isShared')
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
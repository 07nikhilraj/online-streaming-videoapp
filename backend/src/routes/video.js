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
      .select('title originalName filename path size status sensitivity createdAt')
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(videos);
  } catch (err) {
    console.error('Error fetching my videos:', err);
    res.status(500).json({ message: 'Server error fetching videos' });
  }
});

module.exports = router;
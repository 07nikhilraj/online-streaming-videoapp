const express = require('express');
const fs = require('fs');
const path = require('path');
const upload = require('../utils/multerConfig');
const { uploadVideo } = require('../controllers/videoController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const Video = require('../models/Video');
const AuditLog = require('../models/Log');

const router = express.Router();

// ==========================================
// 1. GET ROUTES (Data Retrieval)
// ==========================================

// Get my personal videos (Isolation: Org + User)
router.get('/my-videos', protect, async (req, res) => {
    try {
        const videos = await Video.find({ 
            organizationId: req.user.organizationId,
            uploadedBy: req.user._id 
        })
        .select('title originalName description filename path size status sensitivity uploadedBy createdAt isShared allowedViewers')
        .sort({ createdAt: -1 });

        res.status(200).json(videos);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching videos' });
    }
});

// Get shared videos (Isolation: Org + Specific Access)
router.get('/shared-videos', protect, async (req, res) => {
    try {
        const videos = await Video.find({
            organizationId: req.user.organizationId,
            $or: [
                { isShared: true }, 
                { allowedViewers: req.user.email.toLowerCase() } 
            ]
        }).populate('uploadedBy', 'email');
        
        res.json(videos);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching shared videos' });
    }
});

// Admin: Get ALL videos in the Organization
router.get('/admin/all', protect, restrictTo('admin'), async (req, res) => {
    try {
        const videos = await Video.find({ organizationId: req.user.organizationId })
            .populate('uploadedBy', 'email role')
            .sort({ createdAt: -1 });

        res.json(videos);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching admin videos' });
    }
});

// ==========================================
// 2. POST ROUTES (Creation)
// ==========================================

router.post(
  '/upload',
  protect,
  restrictTo('editor', 'admin'),
  upload.single('video'),     
  uploadVideo
);

// ==========================================
// 3. PATCH ROUTES (Updates/Assignments)
// ==========================================

// Update title & description (Tenant + Ownership)
router.patch('/:id', protect, async (req, res) => {
    try {
        const { title, description } = req.body;
        const video = await Video.findOne({ 
            _id: req.params.id, 
            organizationId: req.user.organizationId 
        });

        if (!video) return res.status(404).json({ message: 'Video not found' });

        // Ownership Check
        if (video.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const oldTitle = video.title;
        if (title !== undefined) video.title = title;
        if (description !== undefined) video.description = description;
        await video.save();

        await AuditLog.create({
            action: 'VIDEO_EDIT',
            performedBy: req.user._id,
            organizationId: req.user.organizationId,
            targetId: video._id,
            details: `Updated metadata for "${oldTitle}". New title: "${video.title}"`
        });

        res.json({ message: 'Video updated', video });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle share status
router.patch('/:id/share', protect, async (req, res) => {
    try {
        const { isShared } = req.body;
        if (typeof isShared !== 'boolean') return res.status(400).json({ message: 'isShared must be boolean' });

        const video = await Video.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (video.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        video.isShared = isShared;
        await video.save();

        await AuditLog.create({
            action: 'VIDEO_SHARE_TOGGLE',
            performedBy: req.user._id,
            organizationId: req.user.organizationId,
            targetId: video._id,
            details: `${isShared ? 'Shared' : 'Unshared'} video "${video.title}"`
        });

        res.json({ message: 'Share status updated', isShared: video.isShared });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Assign a specific viewer
router.patch('/:id/assign', protect, restrictTo('editor', 'admin'), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const video = await Video.findOne({ 
      _id: req.params.id, 
      organizationId: req.user.organizationId 
    });

    if (!video) return res.status(404).json({ message: 'Video not found' });

    // Ownership check
    if (video.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Ensure array exists (defensive)
    if (!Array.isArray(video.allowedViewers)) {
      video.allowedViewers = [];
    }

    if (!video.allowedViewers.includes(normalizedEmail)) {
      video.allowedViewers.push(normalizedEmail);
      await video.save();

      await AuditLog.create({
        action: 'VIDEO_ASSIGN',
        performedBy: req.user._id,
        organizationId: req.user.organizationId,
        details: `Assigned video "${video.title}" to user ${normalizedEmail}`
      });
    }

    res.json({ 
      message: 'User assigned successfully', 
      allowedViewers: video.allowedViewers 
    });

  } catch (err) {
    console.error('[ASSIGN ERROR]', err.message || err);
    res.status(500).json({ 
      message: 'Server error while assigning video',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// ==========================================
// 4. DELETE ROUTES
// ==========================================

router.delete('/:id', protect, async (req, res) => {
    try {
        const video = await Video.findOne({ _id: req.params.id, organizationId: req.user.organizationId });

        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (video.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this video' });
        }

        // Physical deletion from disk
        const filePath = path.resolve(video.path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Video.findByIdAndDelete(req.params.id);

        await AuditLog.create({
            action: 'VIDEO_DELETE',
            performedBy: req.user._id,
            organizationId: req.user.organizationId,
            details: `Deleted video "${video.title}" (File: ${video.originalName})`
        });

        res.json({ message: 'Video deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting video' });
    }
});

module.exports = router;
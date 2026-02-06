const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Video = require('../models/Video'); // ← add this
const AuditLog = require('../models/Log'); // assuming this is your AuditLog model

const router = express.Router();

// Admin: get all users in the same organization
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find({ organizationId: req.user.organizationId })
      .select('-password'); // never return passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Admin: update user role
router.patch('/:id/role', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional: prevent downgrading last admin (safety)
    if (role !== 'admin' && user.role === 'admin') {
      const adminCount = await User.countDocuments({
        organizationId: req.user.organizationId,
        role: 'admin',
      });
      if (adminCount <= 1) {
        return res.status(403).json({ message: 'Cannot remove the last admin' });
      }
    }

    user.role = role;
    await user.save();

    await AuditLog.create({
      action: 'ROLE_UPDATE',
      performedBy: req.user._id,
      targetId: user._id,
      organizationId: req.user.organizationId,
      details: `Changed role of ${user.email} to ${role}`,
    });

    res.json(user);
  } catch (err) {
    console.error('Role update error:', err);
    res.status(500).json({ message: 'Server error updating role' });
  }
});

// Admin: delete user + all their videos
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const userToDelete = await User.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-deletion
    if (userToDelete._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot delete yourself' });
    }

    // Optional: prevent deleting last admin
    if (userToDelete.role === 'admin') {
      const adminCount = await User.countDocuments({
        organizationId: req.user.organizationId,
        role: 'admin',
      });
      if (adminCount <= 1) {
        return res.status(403).json({ message: 'Cannot delete the last admin' });
      }
    }

    // 1. Delete all videos uploaded by this user
    const videos = await Video.find({ uploadedBy: userToDelete._id });
    for (const video of videos) {
      // Optional: delete physical file if you want (uncomment if needed)
      // const fs = require('fs');
      // const filePath = path.resolve(video.path);
      // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await video.deleteOne();
    }

    // 2. Delete the user
    await userToDelete.deleteOne();

    // 3. Audit log
    await AuditLog.create({
      action: 'USER_DELETE',
      performedBy: req.user._id,
      targetId: userToDelete._id,
      organizationId: req.user.organizationId,
      details: `Deleted user ${userToDelete.email} (role: ${userToDelete.role}) and all associated videos (${videos.length})`,
    });

    res.json({ message: 'User and all their videos deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

module.exports = router;
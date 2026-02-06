const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// @desc    Get all system audit logs
// @route   GET /api/admin/logs
// @access  Private (Admin only)
router.get(
  '/logs',
  protect,
  restrictTo('admin'),
  async (req, res) => {
    try {
      // Fetch logs and populate the 'performedBy' field to see who did the action
      const logs = await AuditLog.find()
        .populate('performedBy', 'email role')
        .sort({ createdAt: -1 }) // Get newest logs first
        .limit(100); // Limit to last 100 entries for performance

      res.status(200).json(logs);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      res.status(500).json({ message: 'Server error fetching audit logs' });
    }
  }
);

module.exports = router;
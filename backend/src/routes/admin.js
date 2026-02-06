const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// @desc    Get all system audit logs
// @route   GET /api/admin/logs
// @access  Private (Admin only)
router.get('/logs', protect, restrictTo('admin'), async (req, res) => {
  // Filter logs by the organization of the users involved
  const logs = await AuditLog.find()
    .populate({
      path: 'performedBy',
      match: { organizationId: req.user.organizationId }, // Filter populated user
      select: 'email role'
    })
    .sort({ createdAt: -1 });
    
  // Filter out logs where performedBy didn't match the Admin's Org
  const filteredLogs = logs.filter(log => log.performedBy !== null);
  res.json(filteredLogs);
});

module.exports = router;
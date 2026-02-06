const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Log = require('../models/Log');

const router = express.Router();

// Admin: get all users
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  // Only find users belonging to the Admin's organization
  const users = await User.find({ organizationId: req.user.organizationId });
  res.json(users);
});

// Admin: update user role
router.patch('/:id/role', protect, restrictTo('admin'), async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });

  // done
  const auditlog = new AuditLog({
    action: 'ROLE_UPDATE',
    performedBy: req.user._id,
    targetId: user._id,
    details: `Changed role of ${user.email} to ${role}`
  });
  
   await auditlog.save()

  res.json(user);
});

module.exports = router;

const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Admin: get all users
router.get(
  '/',
  protect,
  restrictTo('admin'),
  async (req, res) => {
    const users = await User.find().select('email role createdAt');
    res.json(users);
  }
);

// Admin: update user role
router.patch(
  '/:id/role',
  protect,
  restrictTo('admin'),
  async (req, res) => {
    const { role } = req.body;

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    res.json(user);
  }
);

module.exports = router;

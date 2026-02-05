// backend/src/routes/test.js
const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route (no auth needed)
router.get('/public', (req, res) => {
  res.json({ message: 'This is a public route - anyone can access' });
});

// Protected route - any logged-in user
router.get('/protected', protect, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Editor-only route
router.get('/editor-only', protect, restrictTo('editor'), (req, res) => {
  res.json({ message: 'Welcome, editor! You can upload/manage videos.' });
});

// Admin-only route
router.get('/admin-only', protect, restrictTo('admin'), (req, res) => {
  res.json({ message: 'Admin dashboard access granted.' });
});

module.exports = router;
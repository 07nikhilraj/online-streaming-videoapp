require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer')
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('Database name:', mongoose.connection.db.databaseName);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed!', err.message);
  });

// Routes
const authRoutes = require('./src/routes/auth');
const testRoutes = require('./src/routes/test');  
const videoRoutes = require('./src/routes/video');

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);  
app.use('/api/videos', videoRoutes);

// uploads folder public (for streaming later)
app.use('/uploads', express.static('uploads'));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors (limits, etc.)
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // General errors, including from fileFilter
    console.error('Error:', err.message || err);
    return res.status(err.status || 400).json({
      message: err.message || 'Invalid request',
      error: 'Bad request'
    });
  }
  next();
});

app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.message || err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message || 'File upload error' });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }

  // Fallback for any other error
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Video App Backend Running' });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
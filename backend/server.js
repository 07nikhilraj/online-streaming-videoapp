require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

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
const usersRoutes = require('./src/routes/users');
const adminRoutes = require('./src/routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/users', usersRoutes)
app.use('/api/admin', adminRoutes)


// Serve uploads with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

// Global error handlers (you had two — merged them cleanly)
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.message || err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message || 'File upload error' });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }

  // Fallback
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Video App Backend Running' });
});

// Socket.io connection + room joining
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins their own room (based on userId sent from frontend)
  socket.on('joinRoom', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');   // ← add this

const app = express();

app.use(cors());
app.use(express.json());

// ── MongoDB Connection ──────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('Database name:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed!');
    console.error('Error message:', err.message);
    // Optional: process.exit(1);  // stop server if DB fails (your choice)
  });

// Your existing route
app.get('/', (req, res) => {
  res.json({ message: 'Video App Backend Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
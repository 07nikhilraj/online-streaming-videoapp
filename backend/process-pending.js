require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./src/models/Video');
const { simulateProcessing } = require('./src/services/videoProcessing');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');

    const pendingVideos = await Video.find({ status: 'pending' });

    if (pendingVideos.length === 0) {
      console.log('No pending videos to process');
      process.exit(0);
    }

    console.log(`Found ${pendingVideos.length} pending videos`);

    // Run simulation for each (in background)
    pendingVideos.forEach((video) => {
      console.log(`Processing old video: ${video._id}`);
      simulateProcessing(video._id, { to: (userId) => ({ emit: (event, data) => console.log(`Would emit to ${userId}:`, data) }) });
    });

    console.log('Started processing all pending videos');
    // Don't exit immediately - let timeouts run
  })
  .catch(err => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./src/models/Video');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected');
    const oldVideos = await Video.find({ isShared: { $exists: false } });
    console.log(`Found ${oldVideos.length} old videos`);

    for (const v of oldVideos) {
      v.isShared = false;
      await v.save();
      console.log(`Fixed: ${v._id}`);
    }

    console.log('All fixed');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
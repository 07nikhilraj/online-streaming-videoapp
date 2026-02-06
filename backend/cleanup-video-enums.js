// scripts/cleanup-video-enums.js
require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./src/models/Video'); // adjust path if your models folder is different

async function cleanupInvalidEnums() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);

    // 2. Find and report invalid documents (for safety)
    const invalidVideos = await Video.find({
      $or: [
        { status: { $nin: ['pending', 'analyzing', 'processing', 'ready', 'failed'] } },
        { sensitivity: { $nin: ['unknown', 'clean', 'flagged'] } }
      ]
    }).select('_id title status sensitivity');

    if (invalidVideos.length === 0) {
      console.log('No documents with invalid status or sensitivity found. Nothing to fix.');
      process.exit(0);
    }

    console.log(`Found ${invalidVideos.length} documents with invalid values:`);
    invalidVideos.forEach(v => {
      console.log(`  - _id: ${v._id} | title: "${v.title || '(no title)'}" | status: ${v.status} | sensitivity: ${v.sensitivity}`);
    });

    // 3. Ask for confirmation (manual safety step)
    console.log('\nDo you want to fix them? (y/n)');
    process.stdin.once('data', async (input) => {
      const answer = input.toString().trim().toLowerCase();

      if (answer === 'y' || answer === 'yes') {
        // 4. Perform the fixes
        const statusResult = await Video.updateMany(
          { status: { $nin: ['pending', 'analyzing', 'processing', 'ready', 'failed'] } },
          { $set: { status: 'failed' } } // or 'pending' — your choice
        );

        const sensitivityResult = await Video.updateMany(
          { sensitivity: { $nin: ['unknown', 'clean', 'flagged'] } },
          { $set: { sensitivity: 'unknown' } }
        );

        console.log('\nCleanup finished:');
        console.log(`  - Fixed status in ${statusResult.modifiedCount} documents`);
        console.log(`  - Fixed sensitivity in ${sensitivityResult.modifiedCount} documents`);

        // Optional: Verify again
        const stillInvalid = await Video.find({
          $or: [
            { status: { $nin: ['pending', 'analyzing', 'processing', 'ready', 'failed'] } },
            { sensitivity: { $nin: ['unknown', 'clean', 'flagged'] } }
          ]
        }).countDocuments();

        console.log(`Remaining invalid documents: ${stillInvalid}`);
      } else {
        console.log('Cleanup cancelled. No changes made.');
      }

      mongoose.connection.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('Error during cleanup:', err.message || err);
    mongoose.connection.close?.();
    process.exit(1);
  }
}

cleanupInvalidEnums();
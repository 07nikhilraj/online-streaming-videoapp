const Video = require('../models/Video');

const simulateProcessing = async (videoId, io) => {
  try {
    const video = await Video.findById(videoId);
    if (!video) return;

    video.status = 'processing';
    await video.save();

    // Simulate progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s per 10%
      console.log(`Emitting progress ${progress}% to room ${video.uploadedBy.toString()}`);
      io.to(video.uploadedBy.toString()).emit('processingProgress', {
        videoId: video._id.toString(),
        progress,
        status: progress < 100 ? 'processing' : 'processed'
      });
    }

    // Finish
    video.status = 'processed';
    // video.sensitivity = 'safe' or 'flagged' – later with real analysis
    await video.save();

    console.log(`Finished processing - emitting 100% to room ${video.uploadedBy.toString()}`);
    io.to(video.uploadedBy.toString()).emit('processingProgress', {
      videoId: video._id.toString(),
      progress: 100,
      status: 'processed'
    });
  } catch (err) {
    console.error('Processing error:', err);
    // Optional: set status 'failed'
  }
};

module.exports = { simulateProcessing };
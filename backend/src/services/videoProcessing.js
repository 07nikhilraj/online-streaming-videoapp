const Video = require('../models/Video');

const processVideo = async (videoId, io) => {
  let video;
  const emitUpdate = (status, percent = 0) => {
    if (!video || !video.uploadedBy) {
      console.warn('[emitUpdate] Skipping emit - video or uploadedBy missing');
      return;
    }
    const room = video.uploadedBy.toString();
    console.log(`[Socket Emit] → room ${room} | ${status} ${percent}% | videoId: ${video._id}`);
    
    io.to(room).emit('videoStatusUpdate', {
      videoId: video._id.toString(),
      status,
      percent: Math.round(percent)
    });
  };

  try {
    video = await Video.findById(videoId);
    if (!video) {
      console.error(`[processVideo] Video not found: ${videoId}`);
      return;
    }

    console.log('[processVideo] Fetched video:', {
      id: video._id,
      uploadedBy: video.uploadedBy,
      organizationId: video.organizationId,
      status: video.status,
      path: video.path
    });

    // Simplified: Skip FFmpeg processing
    // Videos are ready immediately after upload
    video.status = 'analyzing';
    await video.save();
    emitUpdate('analyzing', 50);

    // Simulate brief processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mark as ready
    video.status = 'ready';
    await video.save();
    emitUpdate('ready', 100);

    console.log('[processVideo] Video ready:', video._id);

  } catch (error) {
    console.error('[processVideo] Error:', error.message || error);
    if (video) {
      video.status = 'failed';
      await video.save().catch(saveErr => {
        console.error('[processVideo catch] Save failed:', saveErr);
      });
      emitUpdate('failed', 0);
    }
  }
};

module.exports = { processVideo };
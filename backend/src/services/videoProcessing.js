const Video = require('../models/Video');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

ffmpeg.setFfmpegPath('C:/ffmpeg-2026-02-04-git-627da1111c-essentials_build/bin/ffmpeg.exe'); 
ffmpeg.setFfprobePath('C:/ffmpeg-2026-02-04-git-627da1111c-essentials_build/bin/ffprobe.exe');

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

    // CRITICAL DEBUG: Log the full video doc right after fetch
    console.log('[processVideo] Fetched video:', {
      id: video._id,
      uploadedBy: video.uploadedBy,
      organizationId: video.organizationId,
      status: video.status,
      path: video.path
    });

// 1. Analysis Phase
    video.status = 'analyzing';
    await video.save();
    emitUpdate('analyzing');

    // Fake delay for visibility (optional - remove later)
    await new Promise(resolve => setTimeout(resolve, 1800));

    // 2. Transcoding Phase
    video.status = 'processing';
    await video.save();
    emitUpdate('processing', 0);

    const outputPath = video.path.replace(path.extname(video.path), '-optimized.mp4');
    const newFilename = path.basename(outputPath);

    ffmpeg(video.path)
      .outputOptions([
        '-vcodec libx264',
        '-crf 28',
        '-preset faster',
        '-movflags +faststart'
      ])
      .on('start', () => {
        emitUpdate('processing', 1);
      })
      .on('progress', (progress) => {
        let percent = progress.percent;
        if (isNaN(percent) || percent < 0) percent = 0;
        if (percent > 99) percent = 99;
        emitUpdate('processing', percent);
      })
      .on('end', async () => {
        emitUpdate('processing', 100);
        await new Promise(resolve => setTimeout(resolve, 600));

        video.status = 'ready';
        video.filename = newFilename;
        video.path = outputPath;
        await video.save();
        emitUpdate('ready', 100);
      })
      .on('error', async (err) => {
        console.error('[ffmpeg] Error:', err.message || err);
        video.status = 'failed';
        await video.save().catch(saveErr => {
          console.error('[ffmpeg error handler] Save failed:', saveErr);
        });
        emitUpdate('failed');
      })
      .save(outputPath);
  } catch (error) {
    console.error('[processVideo] Full error:', error.message || error);
    // Safe update even if error happened early
    if (video) {
        video.status = 'failed';
        await video.save().catch(saveErr => {
          console.error('[catch] Save failed:', saveErr);
        });
        emitUpdate('failed');
      } else {
        console.warn('[processVideo] Could not mark failed - video not loaded');
        // Optional: io.emit('videoStatusUpdate', { videoId: videoId.toString(), status: 'failed' });
      }
  }
};

module.exports = { processVideo };
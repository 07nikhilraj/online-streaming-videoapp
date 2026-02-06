const multer = require('multer');
const path = require('path');

// Use memory storage since we'll upload to S3
const storage = multer.memoryStorage();

// File filter – only allow video files
const fileFilter = (req, file, cb) => {
  console.log('Received mimetype:', file.mimetype); // debug

  const allowed = ['video/mp4', 'video/quicktime', 'video/mpeg', 'video/webm'];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only mp4, mov, mpeg, webm videos allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter
});

module.exports = upload;
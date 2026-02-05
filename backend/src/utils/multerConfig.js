const multer = require('multer');
const path = require('path');

// Storage (keep as is)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// FIXED fileFilter – always call cb(), use Error object for rejection
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
const AWS = require('aws-sdk');
const path = require('path');

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} originalFilename - Original filename
 * @returns {Promise<{key: String, url: String}>} - S3 key and URL
 */
const uploadToS3 = async (fileBuffer, originalFilename) => {
  try {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(originalFilename);
    const fileName = `videos/${uniqueSuffix}${fileExtension}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: 'video/mp4', // Adjust based on actual type if needed
    };

    const result = await s3.upload(params).promise();

    return {
      key: result.Key,
      url: result.Location, // Full S3 URL
      filename: `${uniqueSuffix}${fileExtension}`, // For DB storage
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param {String} s3Key - S3 object key
 * @returns {Promise<void>}
 */
const deleteFromS3 = async (s3Key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    await s3.deleteObject(params).promise();
    console.log(`Deleted from S3: ${s3Key}`);
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error(`S3 delete failed: ${error.message}`);
  }
};

/**
 * Get S3 URL for a key
 * @param {String} s3Key - S3 object key
 * @returns {String} - Full S3 URL
 */
const getS3Url = (s3Key) => {
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
};

module.exports = { uploadToS3, deleteFromS3, getS3Url };

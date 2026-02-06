# AWS S3 Setup Guide for Video Uploads

## Step 1: Install AWS SDK

Run this in the backend directory:
```bash
npm install aws-sdk
```

## Step 2: Create an AWS S3 Bucket

1. Go to [AWS Console](https://aws.amazon.com/console/)
2. Search for **S3** and click on it
3. Click **Create bucket**
4. **Bucket name**: `streaming-app-videos-[your-username]` (must be globally unique)
5. **Region**: Choose `us-east-1` (Free tier region)
6. Uncheck **Block all public access** (we need public read access for videos)
7. Click **Create bucket**

## Step 3: Create IAM User with S3 Access

1. Go to **IAM** in AWS Console
2. Click **Users** → **Create user**
3. **User name**: `streaming-app-s3-user`
4. Click **Next**
5. Select **Attach policies directly**
6. Search and select: **AmazonS3FullAccess**
7. Click **Create user**
8. Click on the created user
9. Click **Create access key**
10. Select **Application running outside AWS**
11. Click **Next** and then **Create access key**
12. Copy the following:
    - **Access Key ID**
    - **Secret Access Key**

## Step 4: Update Backend Environment Variables

Replace these in your `.env` file with actual values:

```env
AWS_ACCESS_KEY_ID=your_access_key_from_step_3
AWS_SECRET_ACCESS_KEY=your_secret_key_from_step_3
AWS_REGION=us-east-1
AWS_BUCKET_NAME=streaming-app-videos-[your-username]
```

## Step 5: Update on Render

1. Go to your backend service on Render.com
2. Go to **Environment** tab
3. Add these environment variables with your actual AWS credentials
4. Deploy

## Step 6: Test Upload

1. Login to your app as a user
2. Upload a test video
3. Check S3 bucket in AWS Console to see if the video appears under `videos/` folder

## Free Tier Limits

- **Storage**: 5 GB free per month
- **Requests**: 20,000 GET requests free per month (more than enough for a test app)
- After free tier, you'll need to pay (very cheap for small projects)

## Troubleshooting

- **Access Denied**: Check IAM user has S3FullAccess permission
- **Bucket not found**: Verify bucket name in .env matches exactly
- **Upload fails**: Check AWS credentials are correct and not expired
- **Video won't play**: Ensure bucket is set to public read access

## Video URL Format

Your videos will be accessible at:
```
https://[BUCKET_NAME].s3.[REGION].amazonaws.com/videos/[FILENAME]
```

Example:
```
https://streaming-app-videos-nikhil.s3.us-east-1.amazonaws.com/videos/1707276900000-123456789.mp4
```

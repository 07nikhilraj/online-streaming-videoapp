# Video Management Platform - Complete Documentation

> **Live Demo**: [https://online-streaming-videoapp.netlify.app/login](https://online-streaming-videoapp.netlify.app/login)

---

## Table of Contents

1. [Installation and Setup Guide](#1-installation-and-setup-guide)
2. [API Documentation](#2-api-documentation)
3. [User Manual](#3-user-manual)
4. [Architecture Overview](#4-architecture-overview)
5. [Assumptions and Design Decisions](#5-assumptions-and-design-decisions)

---

# 1. Installation and Setup Guide

## 1.1 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** ≥ 18.0.0
- **MongoDB Atlas** account (or local MongoDB instance)
- **FFmpeg** (for video processing - optional, currently simplified)
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add `bin/` to PATH
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`
- **AWS Account** (for S3 storage - optional but recommended for production)

## 1.2 Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/videouapp?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your-very-long-random-secret-here-keep-it-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# AWS S3 Configuration (Optional - for cloud storage)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=streaming-app-videos-yourname
```

> [!IMPORTANT]
> Replace placeholder values with your actual credentials. Never commit `.env` files to version control.

### Step 4: Start the Backend Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 1.3 Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

For production deployment (e.g., Netlify), update this to your deployed backend URL.

### Step 4: Start the Frontend Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 5: Build for Production (Optional)

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## 1.4 AWS S3 Setup (Optional but Recommended)

### Step 1: Create S3 Bucket

1. Log in to [AWS Console](https://aws.amazon.com/console/)
2. Navigate to **S3** service
3. Click **Create bucket**
4. Enter bucket name: `streaming-app-videos-[your-username]` (must be globally unique)
5. Select region: `us-east-1` (or your preferred region)
6. Uncheck **Block all public access** (required for video playback)
7. Click **Create bucket**

### Step 2: Configure Bucket Policy

1. Go to your bucket → **Permissions** tab
2. Scroll to **Bucket policy** → Click **Edit**
3. Paste the following policy (replace `BUCKET_NAME`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::BUCKET_NAME/videos/*"
        }
    ]
}
```

### Step 3: Create IAM User

1. Navigate to **IAM** → **Users** → **Create user**
2. Username: `streaming-app-s3-user`
3. Attach policy: **AmazonS3FullAccess**
4. Create access key for **Application running outside AWS**
5. Save the **Access Key ID** and **Secret Access Key**

### Step 4: Update Backend Environment Variables

Add the AWS credentials to your backend `.env` file:

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=streaming-app-videos-yourname
```

## 1.5 Database Initialization

The application automatically creates the necessary MongoDB collections on first run. No manual database setup is required.

### Default User Roles

When registering users, you can specify roles:
- `viewer` - Can only view assigned/shared videos
- `editor` - Can upload, edit, and manage their own videos
- `admin` - Full access including user management

## 1.6 Verification

1. Start both backend and frontend servers
2. Navigate to `http://localhost:5173`
3. Register a new account
4. Log in and test video upload functionality

---

# 2. API Documentation

## 2.1 Base URL

- **Local Development**: `http://localhost:5000`
- **Production**: Your deployed backend URL

## 2.2 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 2.3 Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "viewer",
  "organizationId": "org_main"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "viewer",
    "organizationId": "org_main"
  }
}
```

### Login

**POST** `/api/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "viewer",
    "organizationId": "org_main"
  }
}
```

## 2.4 Video Endpoints

### Upload Video

**POST** `/api/videos/upload`

**Authorization**: Editor, Admin

Uploads a video file with metadata.

**Request (multipart/form-data):**
- `video` (file) - Video file
- `title` (string) - Video title
- `description` (string) - Video description

**Response (201):**
```json
{
  "message": "Upload successful, processing started",
  "video": {
    "id": "507f1f77bcf86cd799439012",
    "status": "pending"
  }
}
```

### Get My Videos

**GET** `/api/videos/my-videos`

**Authorization**: All authenticated users

Retrieves all videos uploaded by the current user.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "My Video",
    "description": "Video description",
    "filename": "1707276900000-123456789.mp4",
    "path": "https://bucket.s3.region.amazonaws.com/videos/...",
    "size": "15728640",
    "status": "ready",
    "sensitivity": "unknown",
    "uploadedBy": "507f1f77bcf86cd799439011",
    "isShared": false,
    "allowedViewers": [],
    "createdAt": "2026-02-07T00:00:00.000Z"
  }
]
```

### Get Shared Videos

**GET** `/api/videos/shared-videos`

**Authorization**: All authenticated users

Retrieves videos that are either publicly shared or specifically assigned to the current user.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Shared Video",
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439014",
      "email": "uploader@example.com"
    },
    "isShared": true,
    "status": "ready",
    "path": "https://bucket.s3.region.amazonaws.com/videos/..."
  }
]
```

### Get All Videos (Admin)

**GET** `/api/videos/admin/all`

**Authorization**: Admin only

Retrieves all videos in the organization.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Video Title",
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "role": "editor"
    },
    "status": "ready",
    "createdAt": "2026-02-07T00:00:00.000Z"
  }
]
```

### Update Video Metadata

**PATCH** `/api/videos/:id`

**Authorization**: Video owner or Admin

Updates video title and/or description.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "message": "Video updated",
  "video": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Updated Title",
    "description": "Updated description"
  }
}
```

### Toggle Share Status

**PATCH** `/api/videos/:id/share`

**Authorization**: Video owner or Admin

Makes a video publicly accessible or private.

**Request Body:**
```json
{
  "isShared": true
}
```

**Response (200):**
```json
{
  "message": "Share status updated",
  "isShared": true
}
```

### Assign Video to Viewer

**PATCH** `/api/videos/:id/assign`

**Authorization**: Editor, Admin (video owner)

Assigns a video to a specific user by email.

**Request Body:**
```json
{
  "email": "viewer@example.com"
}
```

**Response (200):**
```json
{
  "message": "User assigned successfully",
  "allowedViewers": ["viewer@example.com"]
}
```

### Delete Video

**DELETE** `/api/videos/:id`

**Authorization**: Video owner or Admin

Deletes a video and its associated file.

**Response (200):**
```json
{
  "message": "Video deleted successfully"
}
```

## 2.5 User Management Endpoints (Admin Only)

### Get All Users

**GET** `/api/users`

**Authorization**: Admin only

Retrieves all users in the organization.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "editor",
    "organizationId": "org_main",
    "createdAt": "2026-02-01T00:00:00.000Z"
  }
]
```

### Update User Role

**PATCH** `/api/users/:id/role`

**Authorization**: Admin only

Changes a user's role.

**Request Body:**
```json
{
  "role": "editor"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "editor",
  "organizationId": "org_main"
}
```

### Delete User

**DELETE** `/api/users/:id`

**Authorization**: Admin only

Deletes a user and all their uploaded videos (cascade delete).

**Response (200):**
```json
{
  "message": "User and all their videos deleted successfully"
}
```

## 2.6 WebSocket Events

The application uses Socket.io for real-time video processing updates.

### Client → Server Events

**`joinRoom`**
```javascript
socket.emit('joinRoom', userId);
```

Joins the user's private room for receiving updates.

### Server → Client Events

**`videoStatusUpdate`**
```javascript
socket.on('videoStatusUpdate', (data) => {
  console.log(data);
  // {
  //   videoId: "507f1f77bcf86cd799439012",
  //   status: "processing",
  //   percent: 50
  // }
});
```

Receives real-time updates about video processing status.

**Status Values:**
- `pending` - Upload complete, waiting to process
- `analyzing` - Initial analysis phase
- `processing` - Video being processed
- `ready` - Video ready for playback
- `failed` - Processing failed

---

# 3. User Manual

## 3.1 Getting Started

### Registration

1. Navigate to the application URL
2. Click **Register** or go to `/register`
3. Enter your email and password
4. Select your role (if registering as first user, you can choose Admin)
5. Optionally specify an organization ID (defaults to `org_main`)
6. Click **Register**

### Login

1. Navigate to `/login`
2. Enter your registered email and password
3. Click **Login**
4. You'll be redirected to the Dashboard

## 3.2 User Roles and Permissions

### Viewer
- ✅ View videos assigned to them
- ✅ View publicly shared videos
- ❌ Cannot upload videos
- ❌ Cannot edit or delete videos
- ❌ Cannot access admin panel

### Editor
- ✅ All Viewer permissions
- ✅ Upload new videos
- ✅ Edit own video metadata (title, description)
- ✅ Share own videos publicly
- ✅ Assign own videos to specific viewers
- ✅ Delete own videos
- ❌ Cannot access admin panel
- ❌ Cannot manage other users' videos

### Admin
- ✅ All Editor permissions
- ✅ View all videos in the organization
- ✅ Edit/delete any video
- ✅ Access admin panel
- ✅ Manage users (view, change roles, delete)
- ✅ View audit logs

## 3.3 Dashboard Features

### Video Upload (Editor/Admin)

1. Click **Upload Video** button
2. Select a video file from your device
3. Enter video title
4. (Optional) Enter description
5. Click **Upload**
6. Watch real-time progress bar as video processes
7. Once status shows **READY**, the video is playable

### Viewing Videos

**My Videos Tab:**
- Shows all videos you've uploaded
- Displays status (pending, processing, ready, failed)
- Real-time progress updates via Socket.io

**Shared Videos Tab:**
- Shows videos shared with you
- Includes publicly shared videos
- Includes videos specifically assigned to you

### Video Actions

**Play Video:**
- Click the play button on any video with status "ready"
- Video streams directly from S3 (or local storage)
- Supports HTTP range requests for seeking

**Edit Video:**
- Click **Edit** on your video
- Update title and/or description
- Click **Save**

**Share Video:**
- Toggle **Share Publicly** switch
- When enabled, all users in your organization can view the video

**Assign to Viewer:**
- Click **Assign to Viewer**
- Enter the viewer's email address
- Click **Assign**
- The specified user will see the video in their "Shared Videos" tab

**Delete Video:**
- Click **Delete** on your video
- Confirm deletion
- Video and file are permanently removed

## 3.4 Admin Panel

Access via `/admin` route (Admin only)

### User Management

**View All Users:**
- See all users in your organization
- View email, role, and registration date

**Change User Role:**
1. Find the user in the table
2. Click **Change Role**
3. Select new role (Viewer, Editor, or Admin)
4. Confirm change

> [!WARNING]
> Cannot downgrade the last admin in the organization

**Delete User:**
1. Click **Delete** next to a user
2. Confirm deletion
3. User and all their videos are permanently deleted

> [!CAUTION]
> This action cannot be undone. All videos uploaded by the user will also be deleted.

### Audit Logs

View all important actions performed in the organization:
- User role changes
- Video uploads
- Video deletions
- Video sharing/assignment
- User deletions

## 3.5 Troubleshooting

### Video Upload Fails
- Check file format (supported: MP4, AVI, MOV, MKV)
- Ensure file size is reasonable
- Verify AWS S3 credentials are correct
- Check backend logs for errors

### Video Stuck in "Processing"
- Check backend server is running
- Verify Socket.io connection is active
- Refresh the page to reconnect
- Check backend logs for processing errors

### Cannot See Shared Videos
- Verify the video is marked as "shared" by the owner
- Ensure you're in the same organization
- Check that your email is in the allowedViewers list (if not publicly shared)

### Real-time Updates Not Working
- Ensure Socket.io connection is established
- Check browser console for connection errors
- Verify backend CORS settings allow your frontend URL
- Try logging out and back in

---

# 4. Architecture Overview

## 4.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login/     │  │   Dashboard  │  │    Admin     │      │
│  │   Register   │  │   (Videos)   │  │    Panel     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                          │                                   │
│                  ┌───────▼────────┐                          │
│                  │  AuthContext   │                          │
│                  │  (JWT + Socket)│                          │
│                  └───────┬────────┘                          │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ HTTP + WebSocket
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Socket.io Server                    │   │
│  │              (Real-time status updates)               │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌────────────┬───────────┴───────────┬──────────────┐      │
│  │   Auth     │      Video            │    User      │      │
│  │   Routes   │      Routes           │    Routes    │      │
│  └─────┬──────┴───────┬───────────────┴──────┬───────┘      │
│        │              │                      │               │
│  ┌─────▼──────────────▼──────────────────────▼───────┐      │
│  │              Middleware Layer                      │      │
│  │  • JWT Authentication (protect)                    │      │
│  │  • Role-Based Access Control (restrictTo)          │      │
│  │  • Multer File Upload                              │      │
│  └────────────────────────┬───────────────────────────┘      │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────┐      │
│  │              Controllers Layer                      │      │
│  │  • authController (login, register)                │      │
│  │  • videoController (upload, CRUD)                  │      │
│  └────────────────────────┬───────────────────────────┘      │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────┐      │
│  │              Services Layer                         │      │
│  │  • videoProcessing (FFmpeg pipeline)               │      │
│  │  • s3Service (AWS S3 upload/delete)                │      │
│  └────────────────────────┬───────────────────────────┘      │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │ MongoDB  │      │  AWS S3  │      │  Local   │
   │  Atlas   │      │ (Videos) │      │  Uploads │
   └──────────┘      └──────────┘      └──────────┘
```

## 4.2 Technology Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js v5
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io v4
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer v2
- **Video Processing**: fluent-ffmpeg (optional)
- **Cloud Storage**: AWS SDK (S3)
- **Security**: bcryptjs (password hashing)

### Frontend
- **Framework**: React v19
- **Build Tool**: Vite v7
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client v4
- **UI Components**: Headless UI, Heroicons
- **Styling**: Tailwind CSS v4
- **Notifications**: react-hot-toast

## 4.3 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['viewer', 'editor', 'admin']),
  organizationId: String (indexed, required),
  createdAt: Date
}
```

### Video Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  originalName: String (required),
  filename: String (required),
  mimeType: String (required),
  path: String (S3 URL or local path),
  s3Key: String (S3 object key),
  status: String (enum: ['pending', 'analyzing', 'processing', 'ready', 'failed']),
  size: String (required),
  uploadedBy: ObjectId (ref: User),
  sensitivity: String (enum: ['unknown', 'clean', 'flagged']),
  isShared: Boolean (default: false),
  allowedViewers: [String] (array of emails),
  organizationId: String (indexed, required),
  createdAt: Date
}
```

### AuditLog Collection
```javascript
{
  _id: ObjectId,
  action: String (required),
  performedBy: ObjectId (ref: User),
  targetId: String,
  details: String,
  organizationId: String,
  createdAt: Date
}
```

## 4.4 Multi-Tenant Architecture

The application implements **organization-based multi-tenancy**:

1. **Data Isolation**: All queries filter by `organizationId`
2. **User Segregation**: Users can only see data within their organization
3. **Shared Resources**: MongoDB instance shared, data logically separated
4. **Security**: Middleware enforces organization boundaries

**Example Query Pattern:**
```javascript
Video.find({ 
  organizationId: req.user.organizationId,
  uploadedBy: req.user._id 
})
```

## 4.5 Authentication Flow

```
1. User submits credentials → POST /api/auth/login
2. Backend validates email/password
3. Backend generates JWT with payload: { id, email, role, organizationId }
4. Frontend stores JWT in localStorage
5. Frontend decodes JWT to get user info
6. All subsequent requests include: Authorization: Bearer <token>
7. Middleware validates JWT and attaches user to req.user
8. Routes check req.user.role for authorization
```

## 4.6 Video Processing Pipeline

```
1. User uploads video → POST /api/videos/upload
2. Multer receives file as buffer
3. s3Service.uploadToS3() uploads to AWS S3
4. Video document created with status: 'pending'
5. processVideo() service triggered asynchronously
6. Status updated to 'analyzing' (50% progress)
7. Socket.io emits update to user's room
8. Brief simulation delay (1 second)
9. Status updated to 'ready' (100% progress)
10. Socket.io emits final update
11. Frontend receives update and refreshes UI
```

> [!NOTE]
> FFmpeg processing is currently simplified. The infrastructure supports full video transcoding but is disabled for faster processing.

## 4.7 Real-Time Communication

**Socket.io Room-Based Architecture:**

1. User logs in → Frontend initializes Socket.io connection
2. Frontend emits `joinRoom` with userId
3. Backend adds socket to room named after userId
4. Video processing emits updates to: `io.to(userId).emit('videoStatusUpdate', data)`
5. Only the video owner receives updates (privacy)
6. Frontend listens and updates UI in real-time

## 4.8 File Storage Strategy

**Current Implementation:**
- Videos uploaded to **AWS S3** (production-ready)
- Fallback to **local uploads/** directory (development)
- S3 URLs stored in database `path` field
- S3 keys stored for deletion operations

**Benefits:**
- Scalable storage
- CDN-ready
- No server disk space concerns
- HTTP range request support (video seeking)

---

# 5. Assumptions and Design Decisions

## 5.1 Assumptions

### User Behavior
1. **Single Organization per User**: Users belong to one organization and cannot switch
2. **Email as Unique Identifier**: Email addresses are unique across the entire system
3. **Trusted Uploads**: Users upload legitimate video content (no automated content moderation yet)
4. **Reasonable File Sizes**: Video files are under typical cloud storage limits

### Technical Environment
1. **Modern Browsers**: Users have browsers supporting ES6+, WebSocket, and HTML5 video
2. **Stable Internet**: Real-time features require persistent connection
3. **MongoDB Atlas**: Cloud database preferred over local MongoDB
4. **AWS S3 Available**: Production deployments use S3 for storage

### Security
1. **HTTPS in Production**: Production deployments use HTTPS for secure token transmission
2. **Strong Passwords**: Users choose passwords ≥6 characters (enforced)
3. **JWT Expiration**: Tokens don't expire (trade-off for simplicity - should be added)

## 5.2 Design Decisions

### Architecture Decisions

**1. Multi-Tenant via organizationId**
- **Decision**: Logical separation using `organizationId` field
- **Rationale**: Simpler than database-per-tenant, cost-effective for small-medium scale
- **Trade-off**: Requires careful query filtering; risk of data leakage if filters missed

**2. JWT-Based Authentication**
- **Decision**: Stateless JWT tokens stored in localStorage
- **Rationale**: Scalable, no server-side session storage needed
- **Trade-off**: Cannot invalidate tokens before expiration; XSS vulnerability if not careful

**3. Socket.io for Real-Time Updates**
- **Decision**: WebSocket-based real-time communication
- **Rationale**: Better UX than polling; instant feedback on video processing
- **Trade-off**: Requires persistent connection; more complex than REST-only

**4. AWS S3 for Video Storage**
- **Decision**: Cloud storage instead of local filesystem
- **Rationale**: Scalable, reliable, supports streaming, no server disk concerns
- **Trade-off**: Additional cost; dependency on AWS; requires credentials management

### Security Decisions

**1. Role-Based Access Control (RBAC)**
- **Decision**: Three roles (Viewer, Editor, Admin) with hierarchical permissions
- **Rationale**: Simple yet flexible; covers most use cases
- **Trade-off**: Not as granular as attribute-based access control (ABAC)

**2. Password Hashing with bcrypt**
- **Decision**: bcrypt with salt rounds = 10
- **Rationale**: Industry standard, resistant to rainbow table attacks
- **Trade-off**: Slower than plain hashing (intentional for security)

**3. Organization-Level Isolation**
- **Decision**: All queries filter by organizationId
- **Rationale**: Prevents cross-organization data access
- **Trade-off**: Requires discipline; easy to forget in new queries

**4. No Token Expiration (Current)**
- **Decision**: JWT tokens don't expire
- **Rationale**: Simplifies development; no refresh token logic needed
- **Trade-off**: Security risk if token stolen; should add expiration in production

### Data Model Decisions

**1. Embedded allowedViewers Array**
- **Decision**: Store viewer emails directly in Video document
- **Rationale**: Simple queries; no join needed; small array size expected
- **Trade-off**: Denormalized; email changes require updates across videos

**2. Soft Delete Not Implemented**
- **Decision**: Hard delete for users and videos
- **Rationale**: Simpler code; immediate data removal
- **Trade-off**: Cannot recover deleted data; no audit trail of deleted items

**3. Audit Logs in Separate Collection**
- **Decision**: Dedicated AuditLog collection for important actions
- **Rationale**: Compliance, debugging, accountability
- **Trade-off**: Additional writes; storage overhead

### Performance Decisions

**1. Simplified Video Processing**
- **Decision**: Skip FFmpeg transcoding; mark videos as ready immediately
- **Rationale**: Faster development; FFmpeg setup complexity; infrastructure ready for future
- **Trade-off**: No format standardization; no quality optimization

**2. No Pagination on Video Lists**
- **Decision**: Return all videos in single query
- **Rationale**: Simpler code; expected small number of videos per user
- **Trade-off**: Performance degrades with many videos; should add pagination later

**3. No Caching Layer**
- **Decision**: Direct database queries for all requests
- **Rationale**: Simpler architecture; MongoDB Atlas is fast enough
- **Trade-off**: Higher database load; slower responses under heavy traffic

### User Experience Decisions

**1. Real-Time Progress Updates**
- **Decision**: Show live progress bar during video processing
- **Rationale**: Better UX; user knows upload succeeded; reduces anxiety
- **Trade-off**: Requires Socket.io complexity

**2. Automatic Organization Assignment**
- **Decision**: Default organizationId = 'org_main'
- **Rationale**: Simplifies onboarding; users don't need to understand organizations
- **Trade-off**: All users in same org by default; requires manual separation

**3. Email-Based Viewer Assignment**
- **Decision**: Assign videos by typing viewer's email
- **Rationale**: Simple, familiar pattern; no need to browse user list
- **Trade-off**: Typos cause silent failures; no autocomplete

### Frontend Decisions

**1. React with Vite**
- **Decision**: Vite instead of Create React App
- **Rationale**: Faster builds, modern tooling, better DX
- **Trade-off**: Less mature ecosystem than CRA

**2. Tailwind CSS**
- **Decision**: Utility-first CSS framework
- **Rationale**: Rapid development, consistent design, small bundle
- **Trade-off**: Verbose HTML; learning curve for non-Tailwind developers

**3. Context API for State Management**
- **Decision**: React Context instead of Redux/Zustand
- **Rationale**: Simpler for small app; built-in; no extra dependencies
- **Trade-off**: Not ideal for large-scale state; can cause unnecessary re-renders

## 5.3 Known Limitations

1. **No Token Expiration**: JWT tokens are valid indefinitely
2. **No Content Moderation**: Sensitivity field exists but not populated
3. **No Video Thumbnails**: Cannot preview videos before playing
4. **No Search/Filter**: Cannot search videos by title or filter by status
5. **No Pagination**: All videos loaded at once (performance issue at scale)
6. **No Rate Limiting**: API endpoints not protected against abuse
7. **No Email Verification**: Users can register with any email
8. **No Password Reset**: Forgot password feature not implemented
9. **No Video Transcoding**: Videos played in original format
10. **No Analytics**: No tracking of video views, user activity, etc.

## 5.4 Future Enhancements

### Short-Term (Next Sprint)
- [ ] Add JWT token expiration and refresh tokens
- [ ] Implement pagination for video lists
- [ ] Add search and filter functionality
- [ ] Generate video thumbnails on upload
- [ ] Add rate limiting to API endpoints

### Medium-Term (Next Quarter)
- [ ] Implement automated content moderation (NSFW detection)
- [ ] Add video transcoding with FFmpeg
- [ ] Support multiple video quality levels (360p, 720p, 1080p)
- [ ] Email verification on registration
- [ ] Password reset functionality
- [ ] Video analytics (views, watch time)

### Long-Term (Future Roadmap)
- [ ] Implement comprehensive testing (unit, integration, E2E)
- [ ] Add Docker support for easy deployment
- [ ] Set up CI/CD pipeline
- [ ] Implement video comments and reactions
- [ ] Add collaborative features (playlists, collections)
- [ ] Support live streaming
- [ ] Mobile app (React Native)

## 5.5 Deployment Considerations

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, random `JWT_SECRET`
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Configure CORS for production frontend URL
- [ ] Set up MongoDB Atlas IP whitelist
- [ ] Configure AWS S3 bucket policies correctly
- [ ] Enable MongoDB Atlas backups
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure logging (e.g., Winston, Morgan)
- [ ] Add rate limiting middleware
- [ ] Implement JWT token expiration
- [ ] Set up CDN for S3 (CloudFront)
- [ ] Configure environment variables on hosting platform
- [ ] Test Socket.io with production WebSocket settings

### Recommended Hosting

**Backend:**
- Render.com (free tier available)
- Heroku
- Railway
- AWS EC2/ECS

**Frontend:**
- Netlify (current deployment)
- Vercel
- AWS S3 + CloudFront

**Database:**
- MongoDB Atlas (current)

**Storage:**
- AWS S3 (current)

---

## Appendix: Quick Reference

### Environment Variables Summary

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost:5173
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET_NAME=...
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:5000
```

### Common Commands

```bash
# Backend
cd backend
npm install
npm run dev          # Development with auto-restart
npm start            # Production

# Frontend
cd frontend
npm install
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build

# Both
npm install          # Install dependencies
```

### Support and Contact

For issues, questions, or contributions:
- **GitHub**: [07nikhilraj/online-streaming-videoapp](https://github.com/07nikhilraj/online-streaming-videoapp)
- **Live Demo**: [https://online-streaming-videoapp.netlify.app/login](https://online-streaming-videoapp.netlify.app/login)

---

**Made with ❤️ in Hyderabad, 2026**

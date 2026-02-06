# Video Management Platform

A secure, multi-tenant video upload, processing, and streaming application with real-time progress updates and role-based access control.

**Live Demo**: (add link when deployed)  
**Backend**: http://localhost:5000  
**Frontend**: http://localhost:5173

## Tech Stack

**Backend**
- Node.js + Express
- MongoDB (Atlas)
- Socket.io (real-time)
- Multer (file upload)
- fluent-ffmpeg (video processing)
- JWT authentication

**Frontend**
- React + Vite
- Axios
- Socket.io-client
- react-hot-toast (notifications)

## Features

- Multi-tenant architecture with organization isolation
- Role-based access control (Viewer / Editor / Admin)
- Video upload with metadata (title, description)
- Real-time processing progress (analyzing → processing → ready/failed)
- Video optimization & streaming (HTTP range requests)
- Share videos publicly or assign to specific viewers
- Admin user management (change roles, delete users + cascade delete videos)
- Audit logging for important actions

## Installation & Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- FFmpeg binary installed and accessible
  - Windows: download from https://ffmpeg.org/download.html → add bin/ to PATH
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`

### Backend Setup

```bash
cd backend
npm install
```

### Create .env file:
``` bash
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/videouapp?retryWrites=true&w=majority
JWT_SECRET=your-very-long-random-secret-here-keep-it-secret
```

### Start Server
``` bash
npm start
# or with auto-restart (recommended for development)
npm run dev
```

### frontend setup
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173  

## Project Structure
project-root/
├── backend/
│   ├── models/           User, Video, Log
│   ├── routes/           auth, videos, users
│   ├── controllers/
│   ├── middleware/       auth protect & restrictTo
│   ├── services/         videoProcessing.js
│   ├── utils/            multerConfig, socket helpers
│   ├── scripts/          cleanup-video-enums.js
│   ├── server.js
│   └── uploads/          (generated - video files)
├── frontend/
│   ├── src/
│   │   ├── components/   VideoCard, UserTable, etc.
│   │   ├── contexts/     AuthContext
│   │   ├── pages/        Dashboard, Admin
│   │   ├── utils/        socket.js
│   │   └── main.jsx
│   └── vite.config.js
└── README.md

## API Endpoints (Summary)

### Auth
- POST `/api/auth/login`
- POST `/api/auth/register`

### Videos
- POST `/api/videos/upload`          (Editor/Admin)
- GET  `/api/videos/my-videos`
- GET  `/api/videos/shared-videos`
- GET  `/api/videos/admin/all`       (Admin)
- PATCH `/api/videos/:id`            (title/desc)
- PATCH `/api/videos/:id/share`
- PATCH `/api/videos/:id/assign`
- DELETE `/api/videos/:id`

### Users (Admin only)
- GET    `/api/users`
- PATCH  `/api/users/:id/role`
- DELETE `/api/users/:id`            (also deletes user's videos)

### Streaming
- GET `/uploads/:filename`           (served via express.static)

## User Guide

### Roles
- **Viewer** — only sees assigned/shared videos
- **Editor** — can upload, edit, share, assign, delete own videos
- **Admin** — full access + manage users

### How to use (basic flow)
1. Register / Login
2. Editor/Admin → Dashboard → Upload video
3. Watch real-time progress bar
4. Once "READY" → play video
5. Share publicly or assign to viewers
6. Admin → manage users & roles

## Important Notes
- Sensitivity field exists but **no automated analysis** yet (defaults to "unknown")
- Videos stored locally in `/uploads/` (easy to switch to S3 later)
- Real-time updates only work when user is logged in (Socket.io rooms per user/org)

## Future Enhancements (planned)
- Automated NSFW/sensitivity detection (e.g. Falconsai model)
- Cloud storage (AWS S3 / Cloudinary)
- Video thumbnails & preview
- Search & advanced filters
- Unit + integration tests (Jest, Supertest, RTL)
- Docker + CI/CD + public deployment

## License
MIT (or choose your license)

Made with ❤️ in Hyderabad, 2026
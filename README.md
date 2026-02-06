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

```text
project-root/
├── backend/                          # Node.js/Express server
│   ├── models/                       # Mongoose schemas (User, Video, AuditLog)
│   ├── routes/                       # API endpoints (Auth, Video, User Management)
│   ├── controllers/                  # Request handlers and business logic
│   ├── middleware/                   # JWT Authentication & RBAC (Role-Based Access Control)
│   ├── services/                     # Core Processing (FFmpeg pipeline + Socket.io emits)
│   ├── utils/                        # Helpers (Multer configuration, etc.)
│   ├── scripts/                      # Database maintenance & cleanup utilities
│   ├── uploads/                      # Local storage for original and optimized videos
│   ├── server.js                     # Entry point: Express + Socket.io initialization
│   └── .env                          # Backend environment variables
│
└── frontend/                         # React + Vite application
    ├── src/
    │   ├── components/               # UI Components (VideoCard, UserTable, Layouts)
    │   ├── contexts/                 # Global State (AuthContext for session/socket mgmt)
    │   ├── pages/                    # Main Views (Dashboard, Admin Panel, Login)
    │   ├── utils/                    # Frontend helpers (Socket.io client init)
    │   ├── App.jsx                   # Main Routing & Provider wrapper
    │   └── main.jsx                  # React DOM entry point
    ├── vite.config.js                # Vite configuration
    └── .env                          # Frontend environment variables## API Endpoints (Summary)
```

## 🛠️ Folder Purposes

### **Backend (`/backend`)**
* **Models**: Defines the data structure for MongoDB. Includes user profiles, video metadata, and audit logs for tracking actions.
* **Services**: The "brain" of the app. `videoProcessing.js` handles the heavy lifting—using FFmpeg to transcode videos and sending real-time progress updates via Socket.io.
* **Controllers**: Bridges the routes and services. Handles logic like mapping organization IDs and triggering the processing pipeline.
* **Uploads**: A generated directory where videos live. 
  > **Note:** In production, this would typically be replaced by cloud storage (AWS S3/Google Cloud Storage).

### **Frontend (`/frontend`)**
* **Components**: Modular UI pieces. `VideoCard.jsx` is the primary interface for video status, real-time progress bars, and the video player.
* **Contexts**: `AuthContext.jsx` manages the user session and ensures the Socket.io connection is tied to the logged-in user for private updates.
* **Utils**: Contains `socket.js`, which initializes the real-time bridge to the backend server.

---

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

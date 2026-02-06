# Video Streaming Application

Full-stack video upload, processing & streaming app with real-time progress.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB Atlas, Socket.io, Multer
- **Frontend**: React (Vite), Axios, Socket.io-client
- **Features**:
  - User registration & login (JWT + RBAC: viewer/editor/admin)
  - Video upload with title/description
  - Real-time processing progress bar
  - Video streaming after processing
  - Delete own videos (or admin)
  - Responsive UI

## How to Run

### Backend
```bash
cd backend
npm install
npm run dev

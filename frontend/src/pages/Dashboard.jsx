// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

// =============================================
// DashboardHeader
// =============================================
const DashboardHeader = ({ user, handleLogout }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937' }}>
        Welcome, {user?.email || 'User'}!
      </h1>
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          fontWeight: '500',
          cursor: 'pointer',
          border: 'none',
        }}
      >
        Logout
      </button>
    </div>
  );
};

// =============================================
// UploadForm
// =============================================
const UploadForm = ({ uploading, uploadError, handleFileChange, title, setTitle, description, setDescription, handleUpload }) => {
  return (
    <div style={{ background: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '1rem', padding: '2rem', marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
        Upload New Video
      </h2>

      {uploadError && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {uploadError}
        </div>
      )}

      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Video Title"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Tell us about your video..."
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: uploading ? '#9ca3af' : '#6366f1',
            color: 'white',
            borderRadius: '0.5rem',
            fontWeight: '500',
            cursor: uploading ? 'not-allowed' : 'pointer',
            border: 'none',
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

// =============================================
// VideoCard
// =============================================
const VideoCard = ({ video, progress, user, handleDelete }) => {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      background: 'white',
    }}>
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
          {video.title || 'Untitled Video'}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {video.originalName}
        </p>
        <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
          Status:{' '}
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500',
              backgroundColor:
                video.status === 'processed' ? '#d1fae5' :
                video.status === 'processing' ? '#fef3c7' :
                '#fee2e2',
              color:
                video.status === 'processed' ? '#065f46' :
                video.status === 'processing' ? '#92400e' :
                '#991b1b',
            }}
          >
            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
          </span>
        </p>

{video.status === 'processing' && progress[video._id] != null && (
  <div style={{ marginTop: '1.25rem', padding: '0 0.5rem' }}>
    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.75rem', color: '#7c3aed' }}>
      LIVE PROGRESS: {progress[video._id]}%
    </div>
    <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '1.5rem', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
      <div
        style={{
          height: '100%',
          background: 'linear-gradient(to right, #22d3ee, #6366f1, #a855f7)',
          width: `${progress[video._id]}%`,
          transition: 'width 1s ease-out',
          minWidth: '2%',
        }}
      />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '500', marginTop: '0.5rem' }}>
      <span style={{ color: '#4338ca' }}>{progress[video._id]}% processed</span>
      <span style={{ color: '#4b5563' }}>Processing...</span>
    </div>
  </div>
)}

        {/* Video Player */}
        {video.status === 'processed' && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <video
              controls
              width="240"
              style={{ borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', background: '#000' }}
              preload="metadata"
              crossOrigin="anonymous"
              // onClick={() => window.open(`http://localhost:5000/uploads/${video.filename}`, '_blank')}
            >
              <source src={`http://localhost:5000/uploads/${video.filename}`} type={video.mimeType || 'video/mp4'} />
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                Video format not supported
              </p>
            </video>
          </div>
        )}

        {/* Delete Button */}
        {(video.uploadedBy === user?.id || user?.role === 'admin') && (
          <button
            onClick={handleDelete}
            style={{
              marginTop: '1.25rem',
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '0.5rem',
              fontWeight: '500',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

// =============================================
// Main Dashboard
// =============================================
const Dashboard = () => {
  const { user, logout: contextLogout } = useAuth();
  const [videos, setVideos] = useState([]);
  const [progress, setProgress] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [socket, setSocket] = useState(null);

  // Socket setup
  useEffect(() => {
    if (!user?.id) return;

    console.log('Initializing socket for user:', user.id);

    const newSocket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket CONNECTED:', newSocket.id);
      newSocket.emit('joinRoom', user.id.toString());
      console.log('Joined room:', user.id.toString());
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
    });

    newSocket.on('processingProgress', (data) => {
      console.log('PROGRESS RECEIVED:', data);
      setProgress((prev) => {
        const updated = { ...prev, [data.videoId]: data.progress };
        console.log('Updated progress state:', updated);
        return updated;
      });
      if (data.progress >= 100) {
        fetchVideos();
      }
    });

    newSocket.on('reconnect', () => {
      newSocket.emit('joinRoom', user.id.toString());
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  // Fetch videos
  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await axios.get('/api/videos/my-videos');
      setVideos(res.data);
    } catch (err) {
      console.error(err);
      setUploadError('Failed to load videos');
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Select a video');

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('title', title || selectedFile.name);
    formData.append('description', description);

    try {
      const res = await axios.post('/api/videos/upload', formData);
      const newVideo = {
        _id: res.data.video.id,
        title: title || selectedFile.name,
        originalName: selectedFile.name,
        status: 'processing',
      };
      setVideos((prev) => [newVideo, ...prev]);
      setProgress((prev) => ({ ...prev, [newVideo._id]: 0 }));
      alert('Upload successful! Processing...');
      setSelectedFile(null);
      setTitle('');
      setDescription('');
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await axios.delete(`/api/videos/${videoId}`);
      setVideos(prev => prev.filter(v => v._id !== videoId));
      alert('Deleted');
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleLogout = () => contextLogout();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f3e8ff, #dbeafe)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <DashboardHeader user={user} handleLogout={handleLogout} />

        {/* Upload Form */}
        <UploadForm
          uploading={uploading}
          uploadError={uploadError}
          handleFileChange={handleFileChange}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          handleUpload={handleUpload}
        />

        {/* Videos Section */}
        <div style={{ background: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '1rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>Your Videos</h2>

          {loadingVideos ? (
            <p style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>Loading videos...</p>
          ) : videos.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>No videos uploaded yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  progress={progress}
                  user={user}
                  handleDelete={() => handleDelete(video._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
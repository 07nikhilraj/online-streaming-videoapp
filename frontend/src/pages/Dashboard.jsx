// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

import DashboardHeader from './DashboardHeader';
import UploadForm from './UploadForm';
import VideoCard from './VideoCard';

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

        {/* Upload Form - only for non-viewers */}
        {user?.role !== 'viewer' && (
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
        )}

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
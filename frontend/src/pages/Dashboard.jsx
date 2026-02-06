// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import toast from 'react-hot-toast'
import { ClipLoader } from 'react-spinners';

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

  useEffect(() => {
    if (user?.role === 'admin') {
      window.location.replace('/admin');
    }
  }, [user]);


  // Socket setup (unchanged)
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

  // Fetch videos - different endpoint for viewers
  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      let url = user?.role === 'viewer' ? '/api/videos/shared-videos' : '/api/videos/my-videos';
      const res = await axios.get(url);
      setVideos(res.data);
    } catch (err) {
      setUploadError('Failed to load videos');
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    if (user) fetchVideos();
  }, [user]);

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile){
      toast.error('Please select a video file');
      return;
    }

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
      toast.success('Upload successful! Processing started...');
      setSelectedFile(null);
      setTitle('');
      setDescription('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Upload failed';
      setUploadError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await axios.delete(`/api/videos/${videoId}`);
      setVideos(prev => prev.filter(v => v._id !== videoId));
      toast.success('Video deleted successfully');
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  const handleShareUpdate = (videoId, isShared) => {
  setVideos((prev) =>
    prev.map((v) =>
      v._id === videoId ? { ...v, isShared } : v
    )
  );
};


  const handleLogout = () => contextLogout();

return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f3e8ff, #dbeafe)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <DashboardHeader user={user} handleLogout={handleLogout} />

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

        <div style={{ background: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '1rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
            {user?.role === 'viewer' ? 'Shared Videos' : 'Your Videos'}
          </h2>

          {loadingVideos ? (
            <p style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>Loading...</p>
          ) : videos.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>No videos available.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  progress={progress}
                  user={user}
                  onShareUpdate={handleShareUpdate}
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
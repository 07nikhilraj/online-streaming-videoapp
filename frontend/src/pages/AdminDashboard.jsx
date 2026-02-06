import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// Components
import DashboardHeader from './DashboardHeader';
import VideoCard from './VideoCard';
import UserTable from './UserTable';

export default function AdminDashboard() {
  const { user, logout: contextLogout } = useAuth();
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch all data (Users and Videos)
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Hits your router.get('/') in user.js and router.get('/admin/all') in video.js
      const [userRes, videoRes] = await Promise.all([
        axios.get('/api/users/'),
        axios.get('api/videos/admin/all')
      ]);

      setUsers(userRes.data);
      setVideos(Array.isArray(videoRes.data) ? videoRes.data : videoRes.data.videos || []);
    } catch (err) {
      console.error('Admin Data Fetch Error:', err);
      toast.error('Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 2. Video Actions
  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/videos/${id}`);
      setVideos(prev => prev.filter(v => v._id !== id));
      toast.success('Video removed from system');
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  const handleShareUpdate = (videoId, isShared) => {
    setVideos(prev =>
      prev.map(v => (v._id === videoId ? { ...v, isShared } : v))
    );
  };

  const stats = {
    totalUsers: users.length,
    totalVideos: videos.length,
    storageUsed: (videos.reduce((acc, v) => acc + (v.size || 0), 0) / (1024 * 1024)).toFixed(2) // MB
    };

  // 3. Render
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #f3e8ff, #dbeafe)', 
      padding: '2rem 1rem' 
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Reusable Header */}
        <DashboardHeader user={user} handleLogout={contextLogout} />

        {/* Main Admin Card */}
        <div style={{ 
          background: 'white', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
          borderRadius: '1.5rem', 
          padding: '2.5rem',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          
          <header style={{ marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', margin: 0 }}>
              Admin Control Panel
            </h1>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
              Manage system users, roles, and global video content.
            </p>
          </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
            { label: 'Total Users', value: stats.totalUsers, color: '#6366f1' },
            { label: 'Active Uploads', value: stats.totalVideos, color: '#8b5cf6' },
            { label: 'Storage Used', value: `${stats.storageUsed} MB`, color: '#ec4899' }
        ].map((stat, idx) => (
            <div key={idx} style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>{stat.label}</p>
            <p style={{ color: stat.color, fontSize: '1.75rem', fontWeight: '700' }}>{stat.value}</p>
            </div>
        ))}
        </div>

          {/* Section 1: User Management */}
          <section style={{ marginBottom: '4rem' }}>
            <UserTable users={users} setUsers={setUsers} />
          </section>

          <hr style={{ border: '0', borderTop: '1px solid #f3f4f6', marginBottom: '3rem' }} />

          {/* Section 2: Video Management */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
                All Uploaded Videos
              </h2>
              <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600' }}>
                {videos.length} Videos Total
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p style={{ color: '#9ca3af' }}>Syncing with database...</p>
              </div>
            ) : videos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', background: '#f9fafb', borderRadius: '1rem' }}>
                <p style={{ color: '#6b7280' }}>No videos have been uploaded to the platform yet.</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                gap: '1.5rem' 
              }}>
                {videos.map(video => (
                  <VideoCard
                    key={video._id}
                    video={video}
                    user={user}
                    handleDelete={() => handleDeleteVideo(video._id)}
                    onShareUpdate={handleShareUpdate}
                    hideOwner={false} // Important for Admin to see who uploaded what
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
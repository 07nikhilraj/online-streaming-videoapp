import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { socket } from '../utils/socket'; 

export default function VideoCard({ video, user, onShareUpdate, handleDelete, hideOwner = true }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(video.title || '');
  const [editDesc, setEditDesc] = useState(video.description || '');
  const [assignEmail, setAssignEmail] = useState('');

  // LOCAL STATE for Real-time updates
  const [status, setStatus] = useState(video.status);
  const [percentage, setPercentage] = useState(0);

  const uploaderId = video.uploadedBy?._id || video.uploadedBy;
  const isOwner = uploaderId?.toString() === user?.id?.toString();
  const isAdmin = user?.role === 'admin';
  const canManage = user?.role !== 'viewer' && (isOwner || isAdmin);

  // FIX: This ensures the player shows for 'ready' (new) or 'processed' (old)
  const isReady = status === 'ready' || status === 'processed';

  useEffect(() => {
  if (!socket) return;

  const handleUpdate = (data) => {
  console.log('[VideoCard] Raw event:', data);
  if (String(data.videoId) === String(video._id)) {
    console.log(`[VideoCard] MATCH for ${video.title}: ${data.status} ${data.percent || ''}%`);
    setStatus(data.status);
    if (data.percent !== undefined) {
      setPercentage(Math.min(Math.max(data.percent, 0), 100)); // clamp
    }
  }
};

  socket.on('videoStatusUpdate', handleUpdate);

  return () => {
    socket.off('videoStatusUpdate', handleUpdate);
  };
}, [video._id]); // Dependency on video._id is vital

  const toggleShare = async (e) => {
    const newShared = e.target.checked;
    try {
      await axios.patch(`/api/videos/${video._id}/share`, { isShared: newShared });
      onShareUpdate(video._id, newShared);
      toast.success(newShared ? 'Video shared' : 'Video unshared');
    } catch (err) {
      toast.error('Failed to update share status');
    }
  };

  const handleAssign = async () => {
    try {
      await axios.patch(`/api/videos/${video._id}/assign`, { email: assignEmail });
      toast.success(`Video assigned to ${assignEmail}`);
      setAssignEmail('');
    } catch (err) {
      toast.error('Error assigning user');
    }
  };

  const saveEdit = async () => {
    try {
      await axios.patch(`/api/videos/${video._id}`, { title: editTitle, description: editDesc });
      toast.success('Video updated');
      setIsEditing(false);
      window.location.reload(); 
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '1rem'
    }}>
      <div style={{ padding: '1.25rem', flex: 1 }}>
        
        {!hideOwner && video.uploadedBy?.email && (
          <div style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', border: '1px dashed #d1d5db' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: '600', textTransform: 'uppercase' }}>Uploader Info</p>
            <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>{video.uploadedBy.email}</p>
          </div>
        )}

        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>{video.title}</h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500',
              backgroundColor: isReady ? '#d1fae5' : '#fef3c7',
              color: isReady ? '#065f46' : '#92400e',
            }}>
            {status.toUpperCase()}
          </span>
        </div>

        {/* REAL-TIME PROGRESS BAR */}
        {(status === 'processing' || status === 'analyzing') && (
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: '#6d28d9', fontWeight: 'bold' }}>{status === 'analyzing' ? '🔍 Analyzing...' : '⚙️ Optimizing...'}</span>
              <span>{percentage}%</span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.6rem', overflow: 'hidden' }}>
              <div style={{
                  height: '100%',
                  background: 'linear-gradient(to right, #6366f1, #a855f7)',
                  width: `${percentage}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}

        {/* VIDEO PLAYER - FIXED CONDITION */}
        {isReady && (
          <div style={{ marginTop: '1rem', background: '#000', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <video controls width="100%" style={{ display: 'block' }}>
              <source src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${video.filename}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* MANAGEMENT BUTTONS */}
        {canManage && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={video.isShared} onChange={toggleShare} />
              <span style={{ fontSize: '0.875rem' }}>Publicly Shared</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsEditing(true)} style={{ flex: 1, padding: '0.5rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        )}

        {/* ASSIGNMENT SECTION */}
        {user.role !== 'viewer' && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="email" 
              placeholder="Viewer email..." 
              value={assignEmail} 
              onChange={(e) => setAssignEmail(e.target.value)} 
              style={{ flex: 1, padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }} 
            />
            <button onClick={handleAssign} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Assign</button>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '450px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Edit Video</h3>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description"
              rows={4}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsEditing(false)} style={{ padding: '0.5rem 1rem', background: '#eee', border: 'none', borderRadius: '4px' }}>Cancel</button>
              <button onClick={saveEdit} style={{ padding: '0.5rem 1rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '4px' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
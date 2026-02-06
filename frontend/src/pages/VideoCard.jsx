// src/pages/VideoCard.jsx
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function VideoCard({ video, progress = {}, user, onShareUpdate, handleDelete, hideOwner = true }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(video.title || '');
  const [editDesc, setEditDesc] = useState(video.description || '');

  // Check ownership: handle both populated object and plain ID string
  const uploaderId = video.uploadedBy?._id || video.uploadedBy;
  const isOwner = uploaderId?.toString() === user?.id?.toString();
  const isAdmin = user?.role === 'admin';

  const canManage = user?.role !== 'viewer' && (isOwner || isAdmin);

  const toggleShare = async (e) => {
    const newShared = e.target.checked;
    try {
      await axios.patch(`/api/videos/${video._id}/share`, {
        isShared: newShared,
      });
      onShareUpdate(video._id, newShared);
      toast.success(newShared ? 'Video shared' : 'Video unshared');
    } catch (err) {
      toast.error('Failed to update share status');
    }
  };

  const saveEdit = async () => {
    try {
      await axios.patch(`/api/videos/${video._id}`, {
        title: editTitle,
        description: editDesc,
      });
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
      flexDirection: 'column'
    }}>
      <div style={{ padding: '1.25rem', flex: 1 }}>
        
        {/* OWNER INFO BADGE (Visible only if hideOwner is false) */}
        {!hideOwner && video.uploadedBy?.email && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.5rem 0.75rem', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.5rem',
            border: '1px dashed #d1d5db'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: '600', textTransform: 'uppercase' }}>
              Uploader Information
            </p>
            <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>
              {video.uploadedBy.email} <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>({video.uploadedBy.role})</span>
            </p>
          </div>
        )}

        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
          {video.title || 'Untitled Video'}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
          {video.description || 'No description'} 
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500',
              backgroundColor: video.status === 'processed' ? '#d1fae5' : '#fef3c7',
              color: video.status === 'processed' ? '#065f46' : '#92400e',
            }}>
            Status: {video.status?.charAt(0).toUpperCase() + video.status?.slice(1)}
          </span>

          <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500',
              backgroundColor: video.isShared ? '#e0e7ff' : '#f3f4f6',
              color: video.isShared ? '#4338ca' : '#6b7280',
            }}>
            {video.isShared ? 'Publicly Shared' : 'Private'}
          </span>
        </div>

        {/* Progress Bar */}
        {video.status === 'processing' && progress[video._id] != null && (
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem', color: '#7c3aed' }}>
              {progress[video._id]}% Processed
            </div>
            <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.75rem', overflow: 'hidden' }}>
              <div style={{
                  height: '100%',
                  background: 'linear-gradient(to right, #6366f1, #a855f7)',
                  width: `${progress[video._id]}%`,
                  transition: 'width 0.5s ease-in-out',
                }}
              />
            </div>
          </div>
        )}

        {/* Video Player */}
        {video.status === 'processed' && (
          <div style={{ marginTop: '1rem', background: '#000', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <video
              controls
              width="100%"
              style={{ display: 'block' }}
              preload="metadata"
              crossOrigin="anonymous"
            >
              <source src={`http://localhost:5000/uploads/${video.filename}`} type={video.mimeType || "video/mp4"} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Manage Section */}
        {canManage && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={video.isShared || false}
                onChange={toggleShare}
                style={{ width: '1.1rem', height: '1.1rem' }}
              />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Share with everyone</span>
            </label>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal (unchanged logic, slightly cleaner styles) */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '450px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Edit Video Details</h3>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description"
              rows={4}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsEditing(false)} style={{ padding: '0.6rem 1.2rem', background: '#f3f4f6', borderRadius: '0.5rem', border: 'none' }}>Cancel</button>
              <button onClick={saveEdit} style={{ padding: '0.6rem 1.2rem', background: '#6366f1', color: 'white', borderRadius: '0.5rem', border: 'none' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
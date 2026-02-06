// src/pages/VideoCard.jsx
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function VideoCard({ video, progress, user, onShareUpdate, handleDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(video.title || '');
  const [editDesc, setEditDesc] = useState(video.description || '');

  const isOwner = video.uploadedBy?.toString() === user?.id?.toString();
  const canManage = isOwner && user?.role !== 'viewer';

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
      window.location.reload(); // refresh to show changes
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
    }}>
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
          {video.title || 'Untitled Video'}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
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
              backgroundColor: video.status === 'processed' ? '#d1fae5' : '#fef3c7',
              color: video.status === 'processed' ? '#065f46' : '#92400e',
            }}
          >
            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
          </span>
        </p>

        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Shared:{' '}
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500',
              backgroundColor: video.isShared ? '#d1fae5' : '#fee2e2',
              color: video.isShared ? '#065f46' : '#991b1b',
            }}
          >
            {video.isShared ? 'Yes' : 'No'}
          </span>
        </p>

        {/* Progress Bar */}
        {video.status === 'processing' && progress[video._id] != null && (
          <div style={{ marginTop: '1rem', padding: '0 0.5rem' }}>
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.75rem', color: '#7c3aed' }}>
              LIVE PROGRESS: {progress[video._id]}%
            </div>
            <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '1.5rem', overflow: 'hidden' }}>
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
              onClick={() => window.open(`/uploads/${video.filename}`, '_blank')}
            >
              <source src={`http://localhost:5000/uploads/${video.filename}`} type={video.mimeType} />
              <source src={`http://localhost:5000/uploads/${video.filename}`} type="video/mp4" />
              <source src={`http://localhost:5000/uploads/${video.filename}`} type="video/quicktime" />
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                Format not supported
              </p>
            </video>
          </div>
        )}

        {/* Manage Section for Editors (toggle + edit) */}
        {canManage && (
          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                checked={video.isShared || false}
                onChange={toggleShare}
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <span>Share with everyone</span>
            </label>

            <button
              onClick={() => setIsEditing(true)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#6366f1',
                color: 'white',
                borderRadius: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              Edit Title & Description
            </button>

            <button
              onClick={handleDelete}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '0.5rem',
              }}
            >
              Delete
            </button>
          </div>
        )}

        {/* Edit Popup */}
        {isEditing && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              width: '90%',
              maxWidth: '500px',
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Edit Video</h3>
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
                <button
                  onClick={() => setIsEditing(false)}
                  style={{ padding: '0.75rem 1.5rem', background: '#6b7280', color: 'white', borderRadius: '0.5rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  style={{ padding: '0.75rem 1.5rem', background: '#6366f1', color: 'white', borderRadius: '0.5rem' }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// src/pages/VideoCard.jsx
export default function VideoCard({ video, progress, user, handleDelete }) {
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

        {/* Progress Bar - only for processing videos */}
        {video.status === 'processing' && progress[video._id] != null && (
          <div style={{ marginTop: '1rem', padding: '0 0.5rem' }}>
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
      onClick={() => window.open(`/uploads/${video.filename}`, '_blank')}
    >
      {/* Primary: use the actual mimeType from DB */}
      <source src={`http://localhost:5000/uploads/${video.filename}`} type={video.mimeType} />

      {/* Fallback 1: force mp4 */}
      <source src={`http://localhost:5000/uploads/${video.filename}`} type="video/mp4" />

      {/* Fallback 2: force quicktime for .mov */}
      <source src={`http://localhost:5000/uploads/${video.filename}`} type="video/quicktime" />

      {/* Fallback 3: generic video */}
      <source src={`http://localhost:5000/uploads/${video.filename}`} type="video/*" />

      <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
        Your browser does not support this video format.
      </p>
    </video>
  </div>
)}


        {/* <div style={{ fontSize: '0.8rem', color: 'gray', marginBottom: '0.5rem' }}>
          DEBUG: user.id = {user?.id} | video.uploadedBy = {video.uploadedBy} | role = {user?.role}
        </div> */}

        {/* Delete Button - hidden for viewers */}
        {(video.uploadedBy === user?.id || user?.role === 'admin') && user?.role !== 'viewer' && (
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
}
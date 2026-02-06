// src/pages/UploadForm.jsx
export default function UploadForm({
  uploading,
  uploadError,
  handleFileChange,
  title,
  setTitle,
  description,
  setDescription,
  handleUpload,
}) {
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
}
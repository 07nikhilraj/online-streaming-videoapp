// src/pages/DashboardHeader.jsx
export default function DashboardHeader({ user, handleLogout }) {
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
}
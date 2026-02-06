import axios from 'axios';
import toast from 'react-hot-toast';

export default function UserTable({ users, setUsers }) {
  const updateRole = async (id, role) => {
    try {
      const res = await axios.patch(`/api/users/${id}/role`, { role });
      setUsers(users.map(u => u._id === id ? res.data : u));
      toast.success(`Role updated to ${role}`);
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
        System Users
      </h2>
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '1rem', color: '#4b5563', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem', color: '#4b5563', fontWeight: '600' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '1rem', color: '#1f2937' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default function AuditLogTable({ logs }) {
  return (
    <div style={{ marginTop: '3rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>System Audit Logs</h2>
      <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Action</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Details</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem', fontWeight: '600' }}>{log.action}</td>
                <td style={{ padding: '0.75rem' }}>{log.details}</td>
                <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem' }}>
                    By: {log.performedBy?.email || 'System'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
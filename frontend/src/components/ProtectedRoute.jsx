import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Wait for AuthContext to finish loading user data from token/session
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Verifying permissions...</div>;
  }

  if (!user) {
    // Not logged in? Redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role? Redirect to their default dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
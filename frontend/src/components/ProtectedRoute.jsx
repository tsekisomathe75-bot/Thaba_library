import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ adminOnly = false, children }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/users" state={{ from: location.pathname }} replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

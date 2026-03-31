import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

export default function ProtectedRoute({ children, role }) {
  const { user, loading, isGestionnaire } = useAuth();

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Chargement...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (role === 'Gestionnaire' && !isGestionnaire())
    return <Navigate to="/stages" replace />;

  return <Layout>{children}</Layout>;
}
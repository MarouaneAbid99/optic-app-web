import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';

export default function AuthGuard() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

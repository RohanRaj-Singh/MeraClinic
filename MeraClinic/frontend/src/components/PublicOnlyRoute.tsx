import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessPath, getDefaultRoute } from '@/lib/routing';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    const requestedPath = location.state?.from?.pathname;
    const redirectTo = requestedPath && canAccessPath(user, requestedPath)
      ? requestedPath
      : getDefaultRoute(user);

    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

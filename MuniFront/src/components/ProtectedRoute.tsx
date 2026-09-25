import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-context';
import { Spinner } from '@/components/Spinner/Spinner';
import { defaultRouteForRole } from '@/router/role-routes';
import type { Permission, Role } from '@/types/auth';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Role[];
  permissions?: Permission[];
}

export function ProtectedRoute({ children, roles, permissions }: ProtectedRouteProps) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner size="lg" label="Cargando..." />
      </div>
    );
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={defaultRouteForRole(user.role)} replace />;
  }

  if (permissions && permissions.length > 0) {
    const missing = permissions.filter((p) => !user.permissions.includes(p));
    if (missing.length > 0) {
      return <Navigate to={defaultRouteForRole(user.role)} replace />;
    }
  }

  return <>{children}</>;
}

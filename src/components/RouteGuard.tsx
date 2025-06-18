
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard = ({ children }: RouteGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: contextLoading, userGroup, userRole } = useUserContext();
  const location = useLocation();

  const loading = authLoading || contextLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // If user is not authenticated
  if (!user) {
    if (isPublicRoute) {
      return <>{children}</>;
    }
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated but on public routes, redirect to dashboard
  if (user && isPublicRoute) {
    if (userGroup === 'business_owner') {
      return <Navigate to="/client/dashboard" replace />;
    } else {
      return <Navigate to="/app/dashboard" replace />;
    }
  }

  // Check role-based access
  const isAppRoute = location.pathname.startsWith('/app');
  const isClientRoute = location.pathname.startsWith('/client');

  if (isAppRoute && userGroup !== 'accounting_firm') {
    return <Navigate to="/client/dashboard" replace />;
  }

  if (isClientRoute && userGroup !== 'business_owner') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;

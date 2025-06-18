
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard = ({ children }: RouteGuardProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  const getRoleDashboard = (userRole: string) => {
    const firmRoles = ['partner', 'senior_staff', 'staff'];
    const clientRoles = ['client', 'management', 'accounting_team'];
    
    if (firmRoles.includes(userRole)) {
      return '/app';
    } else if (clientRoles.includes(userRole)) {
      return '/app'; // All users go to /app, view mode is handled by context
    }
    return '/app'; // Default fallback
  };

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      // Still loading auth state
      if (loading) {
        return;
      }

      const currentPath = location.pathname;
      const isPublicPath = ['/', '/landing', '/auth'].includes(currentPath);
      const isAppPath = currentPath.startsWith('/app');

      // User is not authenticated
      if (!user || !profile) {
        if (isAppPath) {
          console.log('Redirecting unauthenticated user from app to landing');
          navigate('/', { replace: true });
          return;
        }
        // Allow access to public paths
        setIsChecking(false);
        return;
      }

      // User is authenticated
      if (user && profile) {
        // If user is on public paths, redirect to their dashboard
        if (isPublicPath) {
          const dashboardPath = getRoleDashboard(profile.user_role);
          console.log(`Redirecting authenticated user from ${currentPath} to ${dashboardPath}`);
          navigate(dashboardPath, { replace: true });
          return;
        }
        
        // User is accessing app paths - allow access
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    checkAuthAndRedirect();
  }, [user, profile, loading, location.pathname, navigate]);

  // Show loading spinner while checking auth or during redirects
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;

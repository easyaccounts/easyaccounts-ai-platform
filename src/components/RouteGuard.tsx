
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

  const getRoleDashboard = (userGroup: string, userRole: string) => {
    console.log('RouteGuard: Determining dashboard for:', { userGroup, userRole });
    
    // Business owners (client group) go to client dashboard
    if (userGroup === 'business_owner') {
      return '/client/dashboard';
    }
    
    // Accounting firm members
    if (userGroup === 'accounting_firm') {
      if (['partner', 'senior_staff', 'staff'].includes(userRole)) {
        return '/app/dashboard';
      }
      if (userRole === 'client') {
        return '/client/dashboard';
      }
    }
    
    console.warn('RouteGuard: Unknown role configuration, defaulting to /app/dashboard');
    return '/app/dashboard'; // Default fallback
  };

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      if (loading) {
        console.log('RouteGuard: Still loading auth state');
        return;
      }

      const currentPath = location.pathname;
      const isPublicPath = ['/', '/landing', '/auth'].includes(currentPath);
      const isAppPath = currentPath.startsWith('/app');
      const isClientPath = currentPath.startsWith('/client');

      console.log('RouteGuard check:', { 
        currentPath, 
        isPublicPath, 
        isAppPath, 
        isClientPath, 
        user: !!user, 
        profile: profile ? { userGroup: profile.user_group, userRole: profile.user_role } : null 
      });

      // User is not authenticated
      if (!user || !profile) {
        if (isAppPath || isClientPath) {
          console.log('RouteGuard: Redirecting unauthenticated user to landing');
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
          const dashboardPath = getRoleDashboard(profile.user_group, profile.user_role);
          console.log(`RouteGuard: Redirecting authenticated user from ${currentPath} to ${dashboardPath}`);
          navigate(dashboardPath, { replace: true });
          return;
        }
        
        // Check role-based access to protected routes
        if (isAppPath) {
          // Only allow firm members to access /app routes
          if (profile.user_group !== 'accounting_firm' || 
              !['partner', 'senior_staff', 'staff'].includes(profile.user_role)) {
            const correctDashboard = getRoleDashboard(profile.user_group, profile.user_role);
            console.log(`RouteGuard: Redirecting unauthorized user from ${currentPath} to ${correctDashboard}`);
            navigate(correctDashboard, { replace: true });
            return;
          }
        }
        
        if (isClientPath) {
          // Allow business owners and client roles to access /client routes
          const allowedForClient = profile.user_group === 'business_owner' || 
                                  profile.user_role === 'client' ||
                                  ['management', 'accounting_team'].includes(profile.user_role);
          
          if (!allowedForClient) {
            const correctDashboard = getRoleDashboard(profile.user_group, profile.user_role);
            console.log(`RouteGuard: Redirecting unauthorized user from ${currentPath} to ${correctDashboard}`);
            navigate(correctDashboard, { replace: true });
            return;
          }
        }
        
        console.log('RouteGuard: User authorized for current path');
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

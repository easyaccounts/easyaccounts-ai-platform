
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
import DashboardRenderer from '@/components/dashboard/DashboardRenderer';
import ClientDashboard from '@/components/client/ClientDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const { currentView, loading: contextLoading } = useUserContext();

  console.log('App Dashboard rendering:', { 
    profile: profile ? { userGroup: profile.user_group, userRole: profile.user_role } : null,
    currentView,
    authLoading,
    contextLoading
  });

  // Show loading state while auth or context is loading
  if (authLoading || contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle missing profile
  if (!profile) {
    console.error('Dashboard: No profile available');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Profile Not Found
            </CardTitle>
            <CardDescription>
              Unable to load your profile data. Please try refreshing or contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show client dashboard when in client view mode
  if (currentView === 'client') {
    console.log('Dashboard: Rendering ClientDashboard for client view');
    return <ClientDashboard />;
  }

  // Show firm dashboard for firm view mode
  console.log('Dashboard: Rendering DashboardRenderer for firm view');
  return <DashboardRenderer profile={profile} loading={false} error={null} />;
};

export default Dashboard;

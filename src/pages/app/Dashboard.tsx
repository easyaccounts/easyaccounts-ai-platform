
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
import PartnerFirmDashboard from '@/components/dashboards/PartnerFirmDashboard';
import SeniorDashboard from '@/components/dashboards/SeniorDashboard';
import StaffDashboard from '@/components/dashboards/StaffDashboard';
import ClientDashboard from '@/components/dashboards/ClientDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name}! Manage your business accounting here.
          </p>
        </div>
        <ClientDashboard />
      </div>
    );
  }

  // Render role-specific dashboard for firm view
  const renderRoleDashboard = () => {
    const { user_group, user_role } = profile;

    console.log('Dashboard: Determining dashboard for role:', { user_group, user_role });

    if (user_group === 'accounting_firm') {
      switch (user_role) {
        case 'partner':
          return <PartnerFirmDashboard />;
        case 'senior_staff':
          return <SeniorDashboard />;
        case 'staff':
          return <StaffDashboard />;
        default:
          return <PartnerFirmDashboard />; // Fallback
      }
    }

    if (user_group === 'business_owner') {
      switch (user_role) {
        case 'management':
          return <PartnerFirmDashboard />; // Management gets partner-like view
        case 'accounting_team':
          return <StaffDashboard />; // Accounting team gets staff-like view
        default:
          return <ClientDashboard />; // Fallback for business owners
      }
    }

    // Ultimate fallback
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-yellow-600">Unknown Role Configuration</CardTitle>
          <CardDescription>
            Your role configuration is not recognized. Please contact support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            <p>User Group: {user_group}</p>
            <p>User Role: {user_role}</p>
          </div>
          <Button 
            onClick={() => window.location.href = '/auth'} 
            className="w-full"
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Show firm dashboard for firm view mode
  console.log('Dashboard: Rendering role-specific dashboard for firm view');
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome back, {profile.first_name}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your firm today.
        </p>
      </div>
      {renderRoleDashboard()}
    </div>
  );
};

export default Dashboard;


import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
import DashboardRenderer from '@/components/dashboard/DashboardRenderer';
import ClientDashboard from '@/components/client/ClientDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Plus, Users, FileText, Upload, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const { currentView, loading: contextLoading } = useUserContext();
  const navigate = useNavigate();

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

  // Quick actions for firm view based on role
  const getQuickActions = () => {
    const { user_role } = profile;
    
    if (user_role === 'partner') {
      return [
        { 
          title: 'Add Client', 
          description: 'Add a new client to the system',
          icon: Plus, 
          action: () => navigate('/app/clients'),
          color: 'bg-blue-500 hover:bg-blue-600'
        },
        { 
          title: 'Manage Team', 
          description: 'Manage team members and assignments',
          icon: Users, 
          action: () => navigate('/app/team'),
          color: 'bg-green-500 hover:bg-green-600'
        },
        { 
          title: 'Assign Clients', 
          description: 'Assign clients to team members',
          icon: FileText, 
          action: () => navigate('/app/assign-clients'),
          color: 'bg-purple-500 hover:bg-purple-600'
        },
        { 
          title: 'Upload Documents', 
          description: 'Upload client documents',
          icon: Upload, 
          action: () => navigate('/app/transactions'),
          color: 'bg-orange-500 hover:bg-orange-600'
        }
      ];
    } else if (['senior_staff', 'staff'].includes(user_role)) {
      return [
        { 
          title: 'My Tasks', 
          description: 'View and manage your assigned tasks',
          icon: CheckSquare, 
          action: () => navigate('/app/tasks'),
          color: 'bg-blue-500 hover:bg-blue-600'
        },
        { 
          title: 'Upload Documents', 
          description: 'Upload client documents',
          icon: Upload, 
          action: () => navigate('/app/transactions'),
          color: 'bg-green-500 hover:bg-green-600'
        },
        { 
          title: 'My Clients', 
          description: 'View assigned clients',
          icon: Users, 
          action: () => navigate('/app/clients'),
          color: 'bg-purple-500 hover:bg-purple-600'
        }
      ];
    }
    
    return [];
  };

  const quickActions = getQuickActions();

  // Show firm dashboard for firm view mode
  console.log('Dashboard: Rendering DashboardRenderer for firm view');
  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile.first_name}!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your firm today.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-start space-y-2 ${action.color} text-white border-0`}
                  onClick={action.action}
                >
                  <action.icon className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Widgets */}
      <DashboardRenderer profile={profile} loading={false} error={null} />
    </div>
  );
};

export default Dashboard;

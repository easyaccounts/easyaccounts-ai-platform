
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Upload, FileText, BarChart3 } from 'lucide-react';

const ClientDashboard = () => {
  const { profile } = useAuth();
  const { userGroup, userRole, selectedClient, currentClientId } = useUserContext();
  const navigate = useNavigate();

  console.log('Client Dashboard rendering:', { 
    profile: profile ? { userGroup: profile.user_group, userRole: profile.user_role } : null,
    contextUserGroup: userGroup,
    contextUserRole: userRole,
    selectedClient,
    currentClientId
  });

  const quickActions = [
    {
      title: 'Request Deliverable',
      description: 'Request a new deliverable from your accountant',
      icon: MessageSquare,
      action: () => navigate('/client/requests'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Upload Documents',
      description: 'Upload documents for processing',
      icon: Upload,
      action: () => navigate('/client/documents'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'View Deliverables',
      description: 'Check status of your deliverables',
      icon: FileText,
      action: () => navigate('/client/deliverables'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Download Reports',
      description: 'Access your financial reports',
      icon: BarChart3,
      action: () => navigate('/client/reports'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name}! Manage your business accounting here.
          </p>
          {selectedClient && (
            <p className="text-sm text-blue-600 mt-1">
              Viewing: {selectedClient.name}
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for managing your business</CardDescription>
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

      {/* Dashboard Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliverables</CardTitle>
            <CardDescription>Your latest deliverables and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent deliverables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Open requests requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No pending requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Reports</CardTitle>
            <CardDescription>Your most recent financial reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No reports available</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your user details and role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Name:</strong> {profile?.first_name} {profile?.last_name}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>User Group:</strong> {userGroup || profile?.user_group}</p>
            <p><strong>Role:</strong> {userRole || profile?.user_role}</p>
            {currentClientId && <p><strong>Current Client ID:</strong> {currentClientId}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;

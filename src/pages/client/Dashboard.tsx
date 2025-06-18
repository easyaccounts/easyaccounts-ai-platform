
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';

const ClientDashboard = () => {
  const { profile } = useAuth();
  const { userGroup, userRole, selectedClient, currentClientId } = useUserContext();

  console.log('Client Dashboard rendering:', { 
    profile: profile ? { userGroup: profile.user_group, userRole: profile.user_role } : null,
    contextUserGroup: userGroup,
    contextUserRole: userRole,
    selectedClient,
    currentClientId
  });

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


import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
import ClientDashboard from '@/components/dashboards/ClientDashboard';

const ClientDashboardPage = () => {
  const { profile } = useAuth();
  const { selectedClient } = useUserContext();

  console.log('Client Dashboard Page rendering:', { 
    profile: profile ? { userGroup: profile.user_group, userRole: profile.user_role } : null,
    selectedClient
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

      <ClientDashboard />
    </div>
  );
};

export default ClientDashboardPage;

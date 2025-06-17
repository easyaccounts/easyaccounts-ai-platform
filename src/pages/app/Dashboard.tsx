
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSessionContext } from '@/hooks/useSessionContext';
import DashboardRenderer from '@/components/dashboard/DashboardRenderer';
import ClientDashboard from '@/components/client/ClientDashboard';

const Dashboard = () => {
  const { profile } = useAuth();
  const { viewMode } = useSessionContext();

  if (!profile) {
    return <div>Loading...</div>;
  }

  // Show client dashboard when in client view mode
  if (viewMode === 'client') {
    return <ClientDashboard />;
  }

  // Show firm dashboard for firm view mode
  return <DashboardRenderer profile={profile} loading={false} error={null} />;
};

export default Dashboard;


import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
import DashboardRenderer from '@/components/dashboard/DashboardRenderer';
import ClientDashboard from '@/components/client/ClientDashboard';

const Dashboard = () => {
  const { profile } = useAuth();
  const { currentView } = useUserContext();

  if (!profile) {
    return <div>Loading...</div>;
  }

  // Show client dashboard when in client view mode
  if (currentView === 'client') {
    return <ClientDashboard />;
  }

  // Show firm dashboard for firm view mode
  return <DashboardRenderer profile={profile} loading={false} error={null} />;
};

export default Dashboard;

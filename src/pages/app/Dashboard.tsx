
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSessionContext } from '@/hooks/useSessionContext';
import DashboardRenderer from '@/components/dashboard/DashboardRenderer';

const Dashboard = () => {
  const { profile } = useAuth();
  const { viewMode } = useSessionContext();

  if (!profile) {
    return <div>Loading...</div>;
  }

  // Determine dashboard type based on view mode and user role
  let dashboardType = profile.user_role;
  
  // Override dashboard type for client view
  if (viewMode === 'client' && (profile.user_role === 'partner' || profile.user_role === 'management')) {
    dashboardType = 'client';
  }

  return <DashboardRenderer profile={profile} loading={false} error={null} />;
};

export default Dashboard;

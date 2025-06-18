
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardRenderer from '@/components/dashboard/DashboardRenderer';

const Dashboard = () => {
  const { profile, loading } = useAuth();

  console.log('Main Dashboard rendering with profile:', { 
    profile: profile ? { userGroup: profile.user_group, userRole: profile.user_role } : null,
    loading
  });

  return (
    <DashboardRenderer 
      profile={profile} 
      loading={loading} 
      error={null} 
    />
  );
};

export default Dashboard;

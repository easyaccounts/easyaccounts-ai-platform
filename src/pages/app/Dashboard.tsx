
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Database } from '@/integrations/supabase/types';
import DashboardRenderer from '@/components/dashboard/DashboardRenderer';
import LoadingSkeleton from '@/components/dashboard/LoadingSkeleton';

type Profile = Database['public']['Tables']['profiles']['Row'];

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { user, profile: userProfile, error: fetchError } = await getCurrentUser();
        
        if (fetchError) {
          setError(fetchError);
          console.error('Dashboard: Error fetching user data:', fetchError);
          return;
        }

        if (!user) {
          setError('No authenticated user found');
          return;
        }

        if (!userProfile) {
          setError('User profile not found. Please complete your profile setup.');
          return;
        }

        setProfile(userProfile);
        console.log('Dashboard: Successfully loaded profile for:', userProfile.email);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        console.error('Dashboard: Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Show loading skeleton based on detected role
  if (loading) {
    return <LoadingSkeleton role={profile?.user_role || 'default'} />;
  }

  return (
    <div className="space-y-6">
      <DashboardRenderer 
        profile={profile} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default Dashboard;

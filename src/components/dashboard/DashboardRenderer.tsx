
import React from 'react';
import { Database } from '@/integrations/supabase/types';
import PartnerOverview from './widgets/PartnerOverview';
import SeniorOverview from './widgets/SeniorOverview';
import StaffOverview from './widgets/StaffOverview';
import ClientOverview from './widgets/ClientOverview';
import ManagementOverview from './widgets/ManagementOverview';
import AccountingTeamOverview from './widgets/AccountingTeamOverview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardRendererProps {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const DashboardRenderer: React.FC<DashboardRendererProps> = ({ profile, loading, error }) => {
  console.log('DashboardRenderer rendering with:', { 
    profile: profile ? { userGroup: profile.user_group, userRole: profile.user_role } : null,
    loading,
    error 
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('DashboardRenderer error:', error);
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Dashboard Error
          </CardTitle>
          <CardDescription>
            We encountered an issue loading your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Missing profile fallback
  if (!profile) {
    console.error('DashboardRenderer: Profile is null');
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-orange-600">Profile Setup Required</CardTitle>
          <CardDescription>
            Your profile information is incomplete. Please contact support or try logging in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = '/auth'} 
            className="w-full"
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Role-based dashboard rendering
  const renderDashboard = () => {
    const { user_group, user_role } = profile;

    console.log('DashboardRenderer: Determining widget for:', { user_group, user_role });

    // Business Owner roles
    if (user_group === 'business_owner') {
      switch (user_role) {
        case 'management':
          console.log('DashboardRenderer: Rendering ManagementOverview');
          return <ManagementOverview />;
        case 'accounting_team':
          console.log('DashboardRenderer: Rendering AccountingTeamOverview');
          return <AccountingTeamOverview />;
        default:
          console.log('DashboardRenderer: Rendering ClientOverview (business owner fallback)');
          return <ClientOverview />; // Fallback for business owners
      }
    }

    // Accounting Firm roles
    if (user_group === 'accounting_firm') {
      switch (user_role) {
        case 'partner':
          console.log('DashboardRenderer: Rendering PartnerOverview');
          return <PartnerOverview />;
        case 'senior_staff':
          console.log('DashboardRenderer: Rendering SeniorOverview');
          return <SeniorOverview />;
        case 'staff':
          console.log('DashboardRenderer: Rendering StaffOverview');
          return <StaffOverview />;
        case 'client':
          console.log('DashboardRenderer: Rendering ClientOverview');
          return <ClientOverview />;
        default:
          console.log('DashboardRenderer: Rendering PartnerOverview (accounting firm fallback)');
          return <PartnerOverview />; // Fallback for accounting firms
      }
    }

    // Ultimate fallback for unknown roles
    console.error('DashboardRenderer: Unknown role configuration:', { user_group, user_role });
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

  return (
    <div className="fade-in p-6">
      {renderDashboard()}
    </div>
  );
};

export default DashboardRenderer;

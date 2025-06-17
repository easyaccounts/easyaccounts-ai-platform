
import React from 'react';
import { Database } from '@/integrations/supabase/types';
import PartnerOverview from './widgets/PartnerOverview';
import SeniorOverview from './widgets/SeniorOverview';
import StaffOverview from './widgets/StaffOverview';
import ClientOverview from './widgets/ClientOverview';
import ManagementOverview from './widgets/ManagementOverview';
import AccountingTeamOverview from './widgets/AccountingTeamOverview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardRendererProps {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const DashboardRenderer: React.FC<DashboardRendererProps> = ({ profile, loading, error }) => {
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
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  // Missing profile fallback
  if (!profile) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-orange-600">Profile Setup Required</CardTitle>
          <CardDescription>
            Your profile information is incomplete. Please contact support or try logging in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button 
            onClick={() => window.location.href = '/auth'} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Return to Login
          </button>
        </CardContent>
      </Card>
    );
  }

  // Role-based dashboard rendering
  const renderDashboard = () => {
    const { user_group, user_role } = profile;

    console.log('Rendering dashboard for:', { user_group, user_role });

    // Business Owner roles
    if (user_group === 'business_owner') {
      switch (user_role) {
        case 'management':
          return <ManagementOverview />;
        case 'accounting_team':
          return <AccountingTeamOverview />;
        default:
          return <ClientOverview />; // Fallback for business owners
      }
    }

    // Accounting Firm roles
    if (user_group === 'accounting_firm') {
      switch (user_role) {
        case 'partner':
          return <PartnerOverview />;
        case 'senior_staff':
          return <SeniorOverview />;
        case 'staff':
          return <StaffOverview />;
        case 'client':
          return <ClientOverview />;
        default:
          return <PartnerOverview />; // Fallback for accounting firms
      }
    }

    // Ultimate fallback
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
          <button 
            onClick={() => window.location.href = '/app/settings'} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Go to Settings
          </button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="fade-in">
      {renderDashboard()}
    </div>
  );
};

export default DashboardRenderer;

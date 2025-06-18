
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardData {
  totalClients?: number;
  monthlyRevenue?: number;
  activeDeliverables?: number;
  teamMembers?: number;
  topClientsByRevenue?: Array<{ client: string; revenue: number }>;
  assignedClients?: number;
  completedWork?: number;
  pendingReviews?: number;
  revenueImpact?: number;
  pendingTasks?: number;
  completedTasks?: number;
  documentsToReview?: number;
  deliverablesPending?: number;
  uploadsCompleted?: number;
  tasksInProgress?: number;
  openRequests?: number;
}

export const useDashboardData = (role: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['dashboard-data', role, profile?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!profile) throw new Error('No profile available');

      switch (role) {
        case 'partner':
          if (!profile.firm_id) throw new Error('No firm ID available');
          const { data: partnerData, error: partnerError } = await supabase.rpc(
            'get_partner_dashboard_stats',
            { p_firm_id: profile.firm_id }
          );
          if (partnerError) throw partnerError;
          return partnerData || {};

        case 'senior_staff':
          if (!profile.firm_id) throw new Error('No firm ID available');
          const { data: seniorData, error: seniorError } = await supabase.rpc(
            'get_senior_dashboard_stats',
            { p_user_id: profile.id, p_firm_id: profile.firm_id }
          );
          if (seniorError) throw seniorError;
          return seniorData || {};

        case 'staff':
          const { data: staffData, error: staffError } = await supabase.rpc(
            'get_staff_dashboard_stats',
            { p_user_id: profile.id }
          );
          if (staffError) throw staffError;
          return staffData || {};

        case 'client':
          if (!profile.business_id) throw new Error('No business ID available');
          const { data: clientData, error: clientError } = await supabase.rpc(
            'get_client_dashboard_stats',
            { p_client_id: profile.business_id }
          );
          if (clientError) throw clientError;
          return clientData || {};

        default:
          throw new Error(`Unknown role: ${role}`);
      }
    },
    enabled: !!profile,
  });
};


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PartnerDashboardStats {
  totalClients: number;
  monthlyRevenue: number;
  activeDeliverables: number;
  teamMembers: number;
}

interface TopClientByRevenue {
  name: string;
  revenue: number;
}

interface PartnerDashboardData {
  stats: PartnerDashboardStats;
  topClientsByRevenue: TopClientByRevenue[];
}

export const usePartnerDashboard = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['partner-dashboard', profile?.firm_id],
    queryFn: async (): Promise<PartnerDashboardData> => {
      if (!profile?.firm_id) {
        throw new Error('No firm ID available');
      }

      console.log('Fetching partner dashboard data for firm:', profile.firm_id);

      // Fetch all required data in parallel
      const [
        clientsCountResult,
        clientsRevenueResult,
        deliverablesCountResult,
        teamMembersCountResult,
        topClientsResult
      ] = await Promise.all([
        // Total Clients count
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('firm_id', profile.firm_id),

        // Monthly Revenue - fetch all clients with their fees
        supabase
          .from('clients')
          .select('monthly_fee')
          .eq('firm_id', profile.firm_id),

        // Active Deliverables count
        supabase
          .from('deliverables')
          .select('*', { count: 'exact', head: true })
          .eq('firm_id', profile.firm_id)
          .in('status', ['pending', 'in_progress', 'under_review']),

        // Team Members count
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('firm_id', profile.firm_id),

        // Top 5 clients by revenue
        supabase
          .from('clients')
          .select('name, monthly_fee')
          .eq('firm_id', profile.firm_id)
          .order('monthly_fee', { ascending: false })
          .limit(5)
      ]);

      // Handle any errors
      if (clientsCountResult.error) throw clientsCountResult.error;
      if (clientsRevenueResult.error) throw clientsRevenueResult.error;
      if (deliverablesCountResult.error) throw deliverablesCountResult.error;
      if (teamMembersCountResult.error) throw teamMembersCountResult.error;
      if (topClientsResult.error) throw topClientsResult.error;

      // Calculate monthly revenue
      const monthlyRevenue = clientsRevenueResult.data?.reduce(
        (sum, client) => sum + (Number(client.monthly_fee) || 0), 
        0
      ) || 0;

      // Transform top clients data for the chart
      const topClientsByRevenue: TopClientByRevenue[] = topClientsResult.data?.map(client => ({
        name: client.name,
        revenue: Number(client.monthly_fee) || 0
      })) || [];

      const stats: PartnerDashboardStats = {
        totalClients: clientsCountResult.count || 0,
        monthlyRevenue,
        activeDeliverables: deliverablesCountResult.count || 0,
        teamMembers: teamMembersCountResult.count || 0
      };

      console.log('Partner dashboard data fetched successfully:', { stats, topClientsByRevenue });

      return {
        stats,
        topClientsByRevenue
      };
    },
    enabled: !!profile?.firm_id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 3,
  });
};

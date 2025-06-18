
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useFirmDashboard = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['firm-dashboard', profile?.firm_id],
    queryFn: async () => {
      if (!profile?.firm_id) {
        throw new Error('No firm ID available');
      }

      // Get total clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, monthly_fee')
        .eq('firm_id', profile.firm_id);

      if (clientsError) throw clientsError;

      // Get total deliverables
      const { data: deliverablesData, error: deliverablesError } = await supabase
        .from('deliverables')
        .select('id, status, client_id')
        .eq('firm_id', profile.firm_id);

      if (deliverablesError) throw deliverablesError;

      // Get team members
      const { data: teamData, error: teamError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_role')
        .eq('firm_id', profile.firm_id);

      if (teamError) throw teamError;

      // Calculate stats
      const totalClients = clientsData?.length || 0;
      const totalDeliverables = deliverablesData?.length || 0;
      const pendingDeliverables = deliverablesData?.filter(d => d.status === 'pending').length || 0;
      const teamMembers = teamData?.length || 0;

      // Top clients by revenue
      const topClientsByRevenue = clientsData
        ?.sort((a, b) => (b.monthly_fee || 0) - (a.monthly_fee || 0))
        .slice(0, 5)
        .map(client => ({
          name: client.name,
          revenue: client.monthly_fee || 0
        })) || [];

      // Deliverable status distribution
      const statusCounts = deliverablesData?.reduce((acc, deliverable) => {
        acc[deliverable.status] = (acc[deliverable.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const deliverableStatusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count
      }));

      // Recent activity (mock for now)
      const recentActivity = [
        { id: '1', description: 'New client added', timestamp: '2 hours ago' },
        { id: '2', description: 'Deliverable completed', timestamp: '4 hours ago' },
        { id: '3', description: 'Team member assigned', timestamp: '1 day ago' },
      ];

      return {
        totalClients,
        totalDeliverables,
        pendingDeliverables,
        teamMembers,
        topClientsByRevenue,
        deliverableStatusData,
        recentActivity
      };
    },
    enabled: !!profile?.firm_id,
  });
};

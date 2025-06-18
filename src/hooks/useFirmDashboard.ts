
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FirmDashboardData {
  totalClients: number;
  totalDeliverables: number;
  pendingDeliverables: number;
  teamMembers: number;
  topClientsByRevenue: Array<{ name: string; revenue: number }>;
  deliverableStatusData: Array<{ name: string; value: number }>;
  recentActivity: Array<{ id: string; description: string; timestamp: string }>;
}

export const useFirmDashboard = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['firm-dashboard', profile?.firm_id],
    queryFn: async (): Promise<FirmDashboardData> => {
      if (!profile?.firm_id) throw new Error('No firm ID available');

      // Fetch total clients
      const { count: totalClientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('firm_id', profile.firm_id);

      // Fetch total deliverables
      const { count: totalDeliverablesCount } = await supabase
        .from('deliverables')
        .select('*', { count: 'exact', head: true })
        .eq('firm_id', profile.firm_id);

      // Fetch pending deliverables
      const { count: pendingDeliverablesCount } = await supabase
        .from('deliverables')
        .select('*', { count: 'exact', head: true })
        .eq('firm_id', profile.firm_id)
        .in('status', ['pending', 'in_progress']);

      // Fetch team members
      const { count: teamMembersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('firm_id', profile.firm_id);

      // Fetch top clients by revenue
      const { data: topClients } = await supabase
        .from('clients')
        .select('name, monthly_fee')
        .eq('firm_id', profile.firm_id)
        .order('monthly_fee', { ascending: false })
        .limit(5);

      // Fetch deliverable status distribution
      const { data: deliverableStatuses } = await supabase
        .from('deliverables')
        .select('status')
        .eq('firm_id', profile.firm_id);

      // Aggregate deliverable status data
      const statusCounts = deliverableStatuses?.reduce((acc, item) => {
        const status = item.status || 'unknown';
        const statusName = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
        acc[statusName] = (acc[statusName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const deliverableStatusData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value
      }));

      // Fetch recent activity
      const { data: recentActivityData } = await supabase
        .from('audit_logs')
        .select('id, description, created_at, action, entity_type')
        .order('created_at', { ascending: false })
        .limit(5);

      const recentActivity = recentActivityData?.map(item => ({
        id: item.id,
        description: item.description || `${item.action} ${item.entity_type}`,
        timestamp: new Date(item.created_at || '').toLocaleDateString()
      })) || [];

      return {
        totalClients: totalClientsCount || 0,
        totalDeliverables: totalDeliverablesCount || 0,
        pendingDeliverables: pendingDeliverablesCount || 0,
        teamMembers: teamMembersCount || 0,
        topClientsByRevenue: topClients?.map(client => ({
          name: client.name,
          revenue: client.monthly_fee || 0
        })) || [],
        deliverableStatusData,
        recentActivity
      };
    },
    enabled: !!profile?.firm_id,
  });
};

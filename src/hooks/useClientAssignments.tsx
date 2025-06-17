
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type Client = Database['public']['Tables']['clients']['Row'];

export const useClientAssignments = () => {
  const { profile } = useAuth();
  const [assignedClients, setAssignedClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchAssignedClients();
    }
  }, [profile]);

  const fetchAssignedClients = async () => {
    try {
      setLoading(true);

      // Partners can see all firm clients
      if (profile?.user_role === 'partner') {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('firm_id', profile.firm_id)
          .order('name');

        if (error) throw error;
        setAssignedClients(data || []);
      } else {
        // Staff and seniors see only assigned clients
        const { data, error } = await supabase
          .from('team_client_assignments')
          .select(`
            client:clients(*)
          `)
          .eq('team_member_id', profile?.id);

        if (error) throw error;
        setAssignedClients(data?.map(item => item.client).filter(Boolean) || []);
      }
    } catch (error) {
      console.error('Error fetching assigned clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccessClient = (clientId: string): boolean => {
    if (profile?.user_role === 'partner') return true;
    return assignedClients.some(client => client.id === clientId);
  };

  const refreshAssignments = () => {
    fetchAssignedClients();
  };

  return {
    assignedClients,
    loading,
    canAccessClient,
    refreshAssignments
  };
};

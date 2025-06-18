
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_role: string;
  status: string;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
}

interface ClientAssignment {
  id: string;
  client_id: string;
  team_member_id: string;
  clients: { name: string };
  profiles: { first_name: string; last_name: string };
}

export const useTeamManager = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading: loadingTeam } = useQuery({
    queryKey: ['team-members', profile?.firm_id],
    queryFn: async () => {
      if (!profile?.firm_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('firm_id', profile.firm_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!profile?.firm_id,
  });

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['firm-clients', profile?.firm_id],
    queryFn: async () => {
      if (!profile?.firm_id) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('firm_id', profile.firm_id)
        .order('name');
      
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!profile?.firm_id,
  });

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['client-assignments', profile?.firm_id],
    queryFn: async () => {
      if (!profile?.firm_id) return [];
      
      const { data, error } = await supabase
        .from('team_client_assignments')
        .select(`
          *,
          clients(name),
          profiles!team_client_assignments_team_member_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClientAssignment[];
    },
    enabled: !!profile?.firm_id,
  });

  const assignClientMutation = useMutation({
    mutationFn: async ({ clientId, teamMemberId }: { clientId: string; teamMemberId: string }) => {
      const { data, error } = await supabase
        .from('team_client_assignments')
        .insert({
          client_id: clientId,
          team_member_id: teamMemberId,
          assigned_by: profile?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Client assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['client-assignments'] });
    },
    onError: (error) => {
      console.error('Assignment error:', error);
      toast.error('Failed to assign client');
    },
  });

  const refreshTeamMembers = () => {
    queryClient.invalidateQueries({ queryKey: ['team-members', profile?.firm_id] });
  };

  return {
    teamMembers,
    clients,
    assignments,
    isLoading: loadingTeam || loadingClients || loadingAssignments,
    assignClient: assignClientMutation.mutate,
    isAssigning: assignClientMutation.isPending,
    refreshTeamMembers
  };
};

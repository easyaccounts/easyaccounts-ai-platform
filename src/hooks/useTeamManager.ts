
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { UI_MESSAGES, USER_GROUPS } from '@/utils/constants';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_role: string;
  status: string;
  created_at: string;
}

interface ClientAssignment {
  id: string;
  client_id: string;
  team_member_id: string;
  clients: { name: string };
  profiles: { first_name: string; last_name: string };
}

interface CreateTeamMemberData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  user_role: 'senior_staff' | 'staff';
  status: 'active' | 'inactive';
  firm_id: string;
  selectedClients?: string[];
}

interface UpdateTeamMemberData extends Partial<Omit<CreateTeamMemberData, 'email' | 'firm_id'>> {
  id: string;
}

export const useTeamManager = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
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

  // Mutation for creating team members
  const createTeamMemberMutation = useMutation({
    mutationFn: async ({ selectedClients = [], ...memberData }: CreateTeamMemberData) => {
      const newUserId = crypto.randomUUID();
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
          email: memberData.email,
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          phone: memberData.phone,
          user_role: memberData.user_role,
          user_group: USER_GROUPS.ACCOUNTING_FIRM as const,
          firm_id: memberData.firm_id,
          status: memberData.status,
        });

      if (error) throw error;
      
      // Create assignments for the new user
      if (selectedClients.length > 0) {
        const assignments = selectedClients.map(clientId => ({
          user_id: newUserId,
          client_id: clientId,
          assigned_by: profile?.id,
        }));

        const { error: assignmentError } = await supabase
          .from('user_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      return newUserId;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Team member created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['client-assignments'] });
    },
    onError: (error: any) => {
      console.error('Error creating team member:', error);
      toast({
        title: 'Error',
        description: error.message || UI_MESSAGES.ERROR_GENERIC,
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating team members
  const updateTeamMemberMutation = useMutation({
    mutationFn: async ({ id, selectedClients = [], ...memberData }: UpdateTeamMemberData & { selectedClients?: string[] }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          phone: memberData.phone,
          user_role: memberData.user_role,
          status: memberData.status,
        })
        .eq('id', id);

      if (error) throw error;

      // Update assignments
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('user_assignments')
        .delete()
        .eq('user_id', id);

      if (deleteError) throw deleteError;

      // Insert new assignments
      if (selectedClients.length > 0) {
        const assignments = selectedClients.map(clientId => ({
          user_id: id,
          client_id: clientId,
          assigned_by: profile?.id,
        }));

        const { error: assignmentError } = await supabase
          .from('user_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: UI_MESSAGES.SUCCESS_UPDATED,
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['client-assignments'] });
    },
    onError: (error: any) => {
      console.error('Error updating team member:', error);
      toast({
        title: 'Error',
        description: error.message || UI_MESSAGES.ERROR_GENERIC,
        variant: 'destructive',
      });
    },
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
      toast({
        title: 'Success',
        description: 'Client assigned successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['client-assignments'] });
    },
    onError: (error) => {
      console.error('Assignment error:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign client',
        variant: 'destructive',
      });
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
    createTeamMember: createTeamMemberMutation.mutate,
    updateTeamMember: updateTeamMemberMutation.mutate,
    assignClient: assignClientMutation.mutate,
    isCreating: createTeamMemberMutation.isPending,
    isUpdating: updateTeamMemberMutation.isPending,
    isAssigning: assignClientMutation.isPending,
    refreshTeamMembers
  };
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { UI_MESSAGES } from '@/utils/constants';

type Client = Database['public']['Tables']['clients']['Row'];

interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  gstin?: string;
  gst_number?: string;
  pan_number?: string;
  business_type?: string;
  industry?: string;
  monthly_fee?: number;
  billing_cycle?: 'monthly' | 'quarterly' | 'annually';
  status?: 'active' | 'inactive';
  firm_id: string;
}

interface UpdateClientData extends Partial<CreateClientData> {
  id: string;
}

interface ClientFilters {
  searchTerm?: string;
  statusFilter?: string;
}

export const useClientManager = (filters: ClientFilters = {}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching clients with server-side filtering
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', profile?.firm_id, filters],
    queryFn: async () => {
      if (!profile?.firm_id) {
        console.log('No firm_id available for client query');
        return [];
      }
      
      let query = supabase
        .from('clients')
        .select('*')
        .eq('firm_id', profile.firm_id)
        .order('name');

      if (filters.statusFilter && filters.statusFilter !== 'all') {
        query = query.eq('status', filters.statusFilter);
      }

      if (filters.searchTerm) {
        query = query.ilike('name', `%${filters.searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      return data as Client[];
    },
    enabled: !!profile?.firm_id,
  });

  // Mutation for creating clients
  const createClientMutation = useMutation({
    mutationFn: async (clientData: CreateClientData) => {
      console.log('Creating client with data:', clientData);
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Client created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: any) => {
      console.error('Error creating client:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create client',
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating clients
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...clientData }: UpdateClientData) => {
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: UI_MESSAGES.SUCCESS_UPDATED,
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: any) => {
      console.error('Error updating client:', error);
      toast({
        title: 'Error',
        description: error.message || UI_MESSAGES.ERROR_GENERIC,
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting clients
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: UI_MESSAGES.SUCCESS_DELETED,
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: any) => {
      console.error('Error deleting client:', error);
      toast({
        title: 'Error',
        description: error.message || UI_MESSAGES.ERROR_GENERIC,
        variant: 'destructive',
      });
    },
  });

  return {
    clients,
    isLoading,
    error,
    createClient: createClientMutation.mutate,
    updateClient: updateClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
  };
};

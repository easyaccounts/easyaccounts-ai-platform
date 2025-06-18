
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  request_type: string;
  created_at: string;
  assigned_to?: string;
}

interface CreateRequestData {
  title: string;
  description: string;
  request_type: string;
  priority: string;
}

export const useRequestManager = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['client-requests', profile?.business_id],
    queryFn: async () => {
      if (!profile?.business_id) return [];
      
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ServiceRequest[];
    },
    enabled: !!profile?.business_id,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (requestData: CreateRequestData) => {
      if (!profile?.business_id) throw new Error('No business ID available');
      
      const { data, error } = await supabase
        .from('requests')
        .insert({
          ...requestData,
          business_id: profile.business_id,
          created_by: profile.id,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['client-requests'] });
    },
    onError: (error) => {
      console.error('Create request error:', error);
      toast.error('Failed to submit request');
    },
  });

  return {
    requests,
    isLoading,
    createRequest: createRequestMutation.mutate,
    isCreating: createRequestMutation.isPending
  };
};

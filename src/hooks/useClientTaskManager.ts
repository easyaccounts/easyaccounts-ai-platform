
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ClientTask {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  deliverable_id: string;
  deliverables?: {
    title: string;
    client_id: string;
  };
}

export const useClientTaskManager = () => {
  const { profile } = useAuth();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['client-tasks', profile?.business_id],
    queryFn: async () => {
      if (!profile?.business_id) return [];
      
      const { data, error } = await supabase
        .from('deliverable_tasks')
        .select(`
          *,
          deliverables(title, client_id)
        `)
        .eq('deliverables.client_id', profile.business_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClientTask[];
    },
    enabled: !!profile?.business_id,
  });

  return {
    tasks,
    isLoading
  };
};

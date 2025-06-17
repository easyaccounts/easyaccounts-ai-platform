
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type DeliverableTask = Database['public']['Tables']['deliverable_tasks']['Row'] & {
  task_assignments?: Array<{
    assigned_to: string;
    profiles: { first_name: string; last_name: string };
  }>;
  deliverables?: {
    title: string;
    client_id: string;
    clients?: { name: string };
  };
};

export const useDeliverableTasks = () => {
  const { profile } = useAuth();
  const [myTasks, setMyTasks] = useState<DeliverableTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchMyTasks();
    }
  }, [profile]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('deliverable_tasks')
        .select(`
          *,
          task_assignments!inner(
            assigned_to,
            profiles!task_assignments_assigned_to_fkey(first_name, last_name)
          ),
          deliverables(
            title,
            client_id,
            clients(name)
          )
        `)
        .eq('task_assignments.assigned_to', profile?.id)
        .order('due_date', { ascending: true, nullsFirst: true });

      if (error) throw error;
      setMyTasks(data || []);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    return myTasks.filter(task => task.status === status);
  };

  const getOverdueTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return myTasks.filter(task => 
      task.due_date && 
      task.due_date < today && 
      task.status !== 'completed'
    );
  };

  const refreshTasks = () => {
    fetchMyTasks();
  };

  return {
    myTasks,
    loading,
    getTasksByStatus,
    getOverdueTasks,
    refreshTasks
  };
};

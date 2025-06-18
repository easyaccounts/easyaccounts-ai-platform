
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id: string;
  role: string;
  context: string;
  description: string;
  metadata: any;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface UseAuditLogsProps {
  entityType?: string;
  entityId?: string;
  limit?: number;
}

export const useAuditLogs = ({ entityType, entityId, limit = 50 }: UseAuditLogsProps = {}) => {
  const { profile } = useAuth();

  const {
    data: auditLogs = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['audit-logs', entityType, entityId, limit],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
      }

      return data as AuditLog[];
    },
    enabled: !!profile
  });

  const createAuditLog = async (
    entityType: string,
    entityId: string,
    action: string,
    description?: string,
    metadata?: any
  ) => {
    const { data, error } = await supabase.rpc('create_audit_log', {
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_action: action,
      p_description: description,
      p_metadata: metadata
    });

    if (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }

    return data;
  };

  return {
    auditLogs,
    loading,
    error,
    createAuditLog
  };
};

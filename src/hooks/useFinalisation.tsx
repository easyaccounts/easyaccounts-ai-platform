
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

interface FinalisationHookProps {
  entityType: 'report' | 'deliverable';
}

export const useFinalisation = ({ entityType }: FinalisationHookProps) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { createAuditLog } = useAuditLogs();
  const { createNotification } = useNotifications();

  const canFinalise = ['partner', 'senior_staff'].includes(profile?.user_role || '');
  const canShare = ['partner'].includes(profile?.user_role || '');

  const finaliseEntityMutation = useMutation({
    mutationFn: async ({ entityId, description }: { entityId: string; description?: string }) => {
      const table = entityType === 'report' ? 'reports' : 'deliverables';
      
      // Update entity status and finalisation fields
      const { data, error } = await supabase
        .from(table)
        .update({
          status: 'final',
          finalised_at: new Date().toISOString(),
          finalised_by: profile?.id
        })
        .eq('id', entityId)
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await createAuditLog(
        entityType,
        entityId,
        'finalise',
        description || `${entityType} finalised by ${profile?.first_name} ${profile?.last_name}`
      );

      // Get entity details for notifications
      const entity = data;
      
      // Notify team members
      if (entity.client_id) {
        const { data: teamMembers } = await supabase
          .from('team_client_assignments')
          .select('team_member_id, profiles:team_member_id(first_name, last_name)')
          .eq('client_id', entity.client_id);

        if (teamMembers) {
          for (const member of teamMembers) {
            if (member.team_member_id !== profile?.id) {
              await createNotification(
                member.team_member_id,
                'status_change',
                entityType,
                entityId,
                `${entityType} Finalised`,
                `${entity.title || 'Report'} has been finalised and is ready for client sharing`
              );
            }
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityType === 'report' ? 'reports' : 'deliverables'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(`${entityType} finalised successfully`);
    },
    onError: (error) => {
      console.error(`Failed to finalise ${entityType}:`, error);
      toast.error(`Failed to finalise ${entityType}`);
    }
  });

  const shareWithClientMutation = useMutation({
    mutationFn: async ({ entityId, clientNotify = true }: { entityId: string; clientNotify?: boolean }) => {
      const table = entityType === 'report' ? 'reports' : 'deliverables';
      
      // Update entity sharing fields
      const { data, error } = await supabase
        .from(table)
        .update({
          status: 'shared_with_client',
          shared_with_client_at: new Date().toISOString(),
          shared_by: profile?.id
        })
        .eq('id', entityId)
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await createAuditLog(
        entityType,
        entityId,
        'share',
        `${entityType} shared with client by ${profile?.first_name} ${profile?.last_name}`
      );

      // Notify client if requested
      if (clientNotify && data.client_id) {
        // Get client users
        const { data: clientUsers } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('business_id', data.business_id || data.client_id)
          .eq('user_group', 'business_owner');

        if (clientUsers) {
          for (const user of clientUsers) {
            await createNotification(
              user.id,
              'report_shared',
              entityType,
              entityId,
              `New ${entityType} Available`,
              `${data.title || 'Report'} is now available for your review`
            );
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityType === 'report' ? 'reports' : 'deliverables'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success(`${entityType} shared with client successfully`);
    },
    onError: (error) => {
      console.error(`Failed to share ${entityType}:`, error);
      toast.error(`Failed to share ${entityType}`);
    }
  });

  const revokeFinalisation = useMutation({
    mutationFn: async ({ entityId, reason }: { entityId: string; reason?: string }) => {
      const table = entityType === 'report' ? 'reports' : 'deliverables';
      
      // Check if already shared with client
      const { data: entity } = await supabase
        .from(table)
        .select('shared_with_client_at')
        .eq('id', entityId)
        .single();

      if (entity?.shared_with_client_at) {
        throw new Error('Cannot revoke finalisation after sharing with client');
      }

      // Update entity status
      const { data, error } = await supabase
        .from(table)
        .update({
          status: 'under_review',
          finalised_at: null,
          finalised_by: null
        })
        .eq('id', entityId)
        .select()
        .single();

      if (error) throw error;

      // Create audit log
      await createAuditLog(
        entityType,
        entityId,
        'revoke',
        reason || `${entityType} finalisation revoked by ${profile?.first_name} ${profile?.last_name}`
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityType === 'report' ? 'reports' : 'deliverables'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success('Finalisation revoked successfully');
    },
    onError: (error) => {
      console.error('Failed to revoke finalisation:', error);
      toast.error(error.message || 'Failed to revoke finalisation');
    }
  });

  return {
    canFinalise,
    canShare,
    finaliseEntity: finaliseEntityMutation.mutateAsync,
    shareWithClient: shareWithClientMutation.mutateAsync,
    revokeFinalisation: revokeFinalisation.mutateAsync,
    isFinalising: finaliseEntityMutation.isPending,
    isSharing: shareWithClientMutation.isPending,
    isRevoking: revokeFinalisation.isPending
  };
};

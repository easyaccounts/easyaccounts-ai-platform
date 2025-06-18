
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string;
  type: string;
  entity_type: string;
  entity_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
}

export const useNotifications = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      // Manually fetch sender profiles for the notifications
      if (data && data.length > 0) {
        const senderIds = [...new Set(data.map(notif => notif.sender_id).filter(Boolean))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', senderIds);

        // Enrich notifications with sender names
        const enrichedData = data.map(notif => ({
          ...notif,
          sender_name: notif.sender_id && profiles?.find(p => p.id === notif.sender_id)
            ? `${profiles.find(p => p.id === notif.sender_id)?.first_name} ${profiles.find(p => p.id === notif.sender_id)?.last_name}`
            : undefined
        }));

        return enrichedData as Notification[];
      }

      return data as Notification[];
    },
    enabled: !!profile
  });

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${profile.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', profile?.id)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  });

  const createNotification = async (
    recipientId: string,
    type: string,
    entityType: string,
    entityId: string,
    title: string,
    message: string
  ) => {
    const { data, error } = await supabase.rpc('create_notification', {
      p_recipient_id: recipientId,
      p_type: type,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_title: title,
      p_message: message
    });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return data;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    createNotification
  };
};

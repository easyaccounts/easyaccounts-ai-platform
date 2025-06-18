
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type DeliverableThread = Database['public']['Tables']['deliverable_threads']['Row'] & {
  deliverables?: {
    title: string;
    clients?: { name: string };
  };
};

type ThreadMessage = Database['public']['Tables']['thread_messages']['Row'] & {
  profiles?: { first_name: string; last_name: string };
  thread_attachments?: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
  }>;
};

export const useDeliverableMessages = (deliverableId: string) => {
  const { profile } = useAuth();
  const [thread, setThread] = useState<DeliverableThread | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (deliverableId && profile) {
      fetchOrCreateThread();
    }
  }, [deliverableId, profile]);

  useEffect(() => {
    if (thread) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [thread]);

  const fetchOrCreateThread = async () => {
    try {
      // First try to find existing thread
      let { data: existingThread, error } = await supabase
        .from('deliverable_threads')
        .select(`
          *,
          deliverables(
            title,
            clients(name)
          )
        `)
        .eq('deliverable_id', deliverableId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No thread exists, create one
        const { data: newThread, error: createError } = await supabase
          .from('deliverable_threads')
          .insert({
            deliverable_id: deliverableId,
            created_by: profile!.id
          })
          .select(`
            *,
            deliverables(
              title,
              clients(name)
            )
          `)
          .single();

        if (createError) throw createError;
        setThread(newThread);
      } else if (error) {
        throw error;
      } else {
        setThread(existingThread);
      }
    } catch (error) {
      console.error('Error fetching/creating thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!thread) return;

    try {
      const { data, error } = await supabase
        .from('thread_messages')
        .select(`
          *,
          profiles(first_name, last_name),
          thread_attachments(
            id,
            file_url,
            file_name,
            file_type,
            file_size
          )
        `)
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!thread) return;

    const channel = supabase
      .channel('thread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'thread_messages',
          filter: `thread_id=eq.${thread.id}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (message: string, attachments?: File[]) => {
    if (!thread || !profile) return;

    try {
      // Insert message
      const { data: newMessage, error: messageError } = await supabase
        .from('thread_messages')
        .insert({
          thread_id: thread.id,
          sender_id: profile.id,
          message
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Upload attachments if any
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          const fileName = `${profile.id}/${Date.now()}-${file.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('thread-attachments')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('thread-attachments')
            .getPublicUrl(fileName);

          // Save attachment record
          await supabase
            .from('thread_attachments')
            .insert({
              message_id: newMessage.id,
              file_url: urlData.publicUrl,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size
            });
        }
      }

      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    thread,
    messages,
    loading,
    sendMessage,
    refreshMessages: fetchMessages
  };
};


import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Request = Database['public']['Tables']['requests']['Row'];

// Fix: Define proper type for message with sender info
type RequestMessage = Database['public']['Tables']['request_messages']['Row'] & {
  sender?: { first_name: string; last_name: string; user_role: string };
};

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
}

const RequestDetailsModal = ({ isOpen, onClose, request }: RequestDetailsModalProps) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const canManageRequests = profile?.user_group === 'accounting_firm';
  const canAddInternalNotes = canManageRequests;

  useEffect(() => {
    if (request && isOpen) {
      fetchMessages();
    }
  }, [request, isOpen]);

  const fetchMessages = async () => {
    if (!request) return;

    try {
      // Fix: Use proper join syntax
      const { data: messagesData, error } = await supabase
        .from('request_messages')
        .select('*')
        .eq('request_id', request.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Fetch sender profiles separately to avoid foreign key issues
      const senderIds = messagesData?.map(m => m.sender_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_role')
        .in('id', senderIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setMessages(messagesData || []);
        return;
      }

      // Combine messages with sender data
      const messagesWithSenders = messagesData?.map(message => ({
        ...message,
        sender: profiles?.find(p => p.id === message.sender_id)
      })) || [];

      setMessages(messagesWithSenders);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!request || !newMessage.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('request_messages')
        .insert([{
          request_id: request.id,
          sender_id: profile?.id,
          message_text: newMessage,
          is_internal: isInternal
        }]);

      if (error) throw error;

      setNewMessage('');
      setIsInternal(false);
      toast.success('Message sent successfully');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!request) return;

    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', request.id);

      if (error) throw error;

      toast.success('Status updated successfully');
      // Update the request status locally
      if (request) {
        request.status = newStatus;
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>{request.title}</DialogTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">
                  {request.request_type?.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="secondary">{request.priority}</Badge>
                <Badge variant="default">{request.status.replace('_', ' ')}</Badge>
              </div>
            </div>
            {canManageRequests && (
              <div className="flex gap-2">
                <Select value={request.status} onValueChange={handleStatusUpdate}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Original Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {request.description}
              </p>
              <div className="text-xs text-muted-foreground mt-2">
                Submitted on {formatDate(request.created_at)}
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-64">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(message.sender?.first_name, message.sender?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">
                          {message.sender?.first_name} {message.sender?.last_name}
                        </span>
                        <span>({message.sender?.user_role})</span>
                        {message.is_internal && (
                          <Badge variant="outline" className="text-xs">Internal</Badge>
                        )}
                        <span>{formatDate(message.created_at || '')}</span>
                      </div>
                      <p className="text-sm mt-1">{message.message_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  {canAddInternalNotes && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="internal"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                      />
                      <label htmlFor="internal" className="text-sm">
                        Internal note (not visible to client)
                      </label>
                    </div>
                  )}
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim()}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDetailsModal;

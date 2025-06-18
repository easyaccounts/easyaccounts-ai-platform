
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TransactionCommentsModalProps {
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionCommentsModal = ({ transactionId, isOpen, onClose }: TransactionCommentsModalProps) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['transaction-comments', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaction_comments')
        .select(`
          id,
          comment,
          created_at,
          profiles:user_id(id, first_name, last_name)
        `)
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen && !!transactionId
  });

  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const { data, error } = await supabase
        .from('transaction_comments')
        .insert({
          transaction_id: transactionId,
          user_id: profile?.id,
          comment
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-comments', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setNewComment('');
      toast.success('Comment added successfully');
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Transaction Comments
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">No comments yet</p>
              <p className="text-sm text-muted-foreground">Be the first to add a comment</p>
            </div>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">
                      {comment.profiles?.first_name} {comment.profiles?.last_name}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              type="submit"
              disabled={!newComment.trim() || addCommentMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionCommentsModal;

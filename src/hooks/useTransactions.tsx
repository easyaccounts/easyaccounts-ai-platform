
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TransactionFilters {
  cycle?: string;
  search?: string;
  status?: string;
  dateRange?: string;
  clientId?: string;
  deliverableId?: string;
}

interface CreateTransactionData {
  cycle: string;
  source: string;
  narration: string;
  amount: number;
  transaction_date: string;
  client_id: string;
  deliverable_id?: string;
  lines?: any[];
  document_url?: string;
}

export const useTransactions = (filters: TransactionFilters = {}) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: transactions = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          clients:client_id(id, name),
          deliverables:deliverable_id(id, title),
          profiles:created_by(id, first_name, last_name),
          transaction_comments(
            id,
            comment,
            created_at,
            profiles:user_id(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.cycle) {
        query = query.eq('cycle', filters.cycle);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      if (filters.deliverableId) {
        query = query.eq('deliverable_id', filters.deliverableId);
      }

      if (filters.search) {
        query = query.or(`narration.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%`);
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'quarter':
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('transaction_date', startDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          ...data,
          created_by: profile?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction created successfully');
    },
    onError: (error) => {
      console.error('Failed to create transaction:', error);
      toast.error('Failed to create transaction');
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreateTransactionData>) => {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        throw error;
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update transaction:', error);
      toast.error('Failed to update transaction');
    }
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'submitted' })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      // Log the action
      const { error: logError } = await supabase
        .from('transaction_review_log')
        .insert({
          transaction_id: transactionId,
          reviewer_id: profile?.id,
          action: 'submitted'
        });

      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction submitted for review');
    },
    onError: (error) => {
      console.error('Failed to submit transaction:', error);
      toast.error('Failed to submit transaction');
    }
  });

  const approveTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, comment }: { transactionId: string; comment?: string }) => {
      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'approved' })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      // Log the action
      const { error: logError } = await supabase
        .from('transaction_review_log')
        .insert({
          transaction_id: transactionId,
          reviewer_id: profile?.id,
          action: 'approved',
          comment
        });

      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction approved successfully');
    },
    onError: (error) => {
      console.error('Failed to approve transaction:', error);
      toast.error('Failed to approve transaction');
    }
  });

  return {
    transactions,
    loading,
    error,
    createTransaction: createTransactionMutation.mutateAsync,
    updateTransaction: updateTransactionMutation.mutateAsync,
    submitForReview: submitForReviewMutation.mutateAsync,
    approveTransaction: approveTransactionMutation.mutateAsync
  };
};

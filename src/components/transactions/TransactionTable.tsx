
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Edit, MessageSquare, FileText, CheckCircle, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import TransactionDetailsModal from './TransactionDetailsModal';
import TransactionCommentsModal from './TransactionCommentsModal';

interface TransactionTableProps {
  transactions: any[];
  loading: boolean;
  onUpdateTransaction: (data: any) => Promise<void>;
  cycle: any;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-500';
    case 'submitted':
      return 'bg-blue-500';
    case 'reviewed':
      return 'bg-orange-500';
    case 'approved':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'upload':
      return <FileText className="w-4 h-4" />;
    case 'import':
      return <FileText className="w-4 h-4" />;
    default:
      return <Edit className="w-4 h-4" />;
  }
};

const TransactionTable = ({ transactions, loading, onUpdateTransaction, cycle }: TransactionTableProps) => {
  const { profile } = useAuth();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showComments, setShowComments] = useState<string | null>(null);

  const canEdit = (transaction: any) => {
    if (profile?.user_role === 'partner') return true;
    if (profile?.user_role === 'senior_staff' && ['draft', 'submitted'].includes(transaction.status)) return true;
    if (profile?.user_role === 'staff' && transaction.status === 'draft' && transaction.created_by === profile?.id) return true;
    return false;
  };

  const canApprove = (transaction: any) => {
    return profile?.user_role === 'partner' || 
           (profile?.user_role === 'senior_staff' && transaction.status === 'submitted');
  };

  const handleStatusChange = async (transaction: any, newStatus: string) => {
    try {
      await onUpdateTransaction({
        id: transaction.id,
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className={`w-16 h-16 rounded-full ${cycle.color} mx-auto mb-4 opacity-20`} />
        <h3 className="text-lg font-medium mb-2">No transactions found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first {cycle.name.toLowerCase()} transaction to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate" title={transaction.narration}>
                    {transaction.narration}
                  </div>
                  {transaction.reference_number && (
                    <div className="text-xs text-muted-foreground">
                      Ref: {transaction.reference_number}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{transaction.clients?.name}</div>
                  {transaction.deliverables && (
                    <div className="text-xs text-muted-foreground">
                      {transaction.deliverables.title}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-mono">
                    ₹{Number(transaction.amount).toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {getSourceIcon(transaction.source)}
                    <span className="capitalize">{transaction.source}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(transaction.status)} text-white`}>
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {transaction.profiles?.first_name} {transaction.profiles?.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(transaction.created_at), 'MMM dd, HH:mm')}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowComments(transaction.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comments ({transaction.transaction_comments?.length || 0})
                      </DropdownMenuItem>
                      {canApprove(transaction) && transaction.status === 'submitted' && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(transaction, 'approved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {canEdit(transaction) && transaction.status !== 'approved' && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(transaction, 'returned')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Return for Revision
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={true}
          onClose={() => setSelectedTransaction(null)}
          onUpdate={onUpdateTransaction}
        />
      )}

      {showComments && (
        <TransactionCommentsModal
          transactionId={showComments}
          isOpen={true}
          onClose={() => setShowComments(null)}
        />
      )}
    </>
  );
};

export default TransactionTable;

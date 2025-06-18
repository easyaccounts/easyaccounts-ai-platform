
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { FileText, User, Calendar, DollarSign } from 'lucide-react';

interface TransactionDetailsModalProps {
  transaction: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any) => Promise<void>;
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

const TransactionDetailsModal = ({ transaction, isOpen, onClose }: TransactionDetailsModalProps) => {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Transaction Details</span>
            <Badge className={`${getStatusColor(transaction.status)} text-white`}>
              {transaction.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium font-mono">
                    ₹{Number(transaction.amount).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Reference</p>
                  <p className="font-medium">
                    {transaction.reference_number || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">
                    {transaction.profiles?.first_name} {transaction.profiles?.last_name}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="font-medium">{transaction.narration}</p>
              </div>
            </CardContent>
          </Card>

          {/* Client & Deliverable */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{transaction.clients?.name}</p>
                </div>
                {transaction.deliverables && (
                  <div>
                    <p className="text-sm text-muted-foreground">Deliverable</p>
                    <p className="font-medium">{transaction.deliverables.title}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Journal Lines */}
          {transaction.lines && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Journal Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transaction.lines.map((line: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div className="md:col-span-2">
                          <p className="font-medium">{line.account_name}</p>
                          <p className="text-sm text-muted-foreground">{line.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Debit</p>
                          <p className="font-mono">
                            {line.debit > 0 ? `₹${line.debit.toLocaleString()}` : '-'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Credit</p>
                          <p className="font-mono">
                            {line.credit > 0 ? `₹${line.credit.toLocaleString()}` : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3">
                    <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                      <div className="text-right">
                        Total Debits: ₹{transaction.lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-right">
                        Total Credits: ₹{transaction.lines.reduce((sum: number, line: any) => sum + (line.credit || 0), 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Source & Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-medium capitalize">{transaction.source}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cycle</p>
                  <p className="font-medium capitalize">{transaction.cycle?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              {transaction.document_url && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Document</p>
                  <a
                    href={transaction.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View attached document</span>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;

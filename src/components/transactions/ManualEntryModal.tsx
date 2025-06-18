
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Calculator } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  cycle: any;
}

interface JournalLine {
  account_id: string;
  account_name: string;
  debit: number;
  credit: number;
  description: string;
}

const ManualEntryModal = ({ isOpen, onClose, onSubmit, cycle }: ManualEntryModalProps) => {
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    narration: '',
    reference_number: '',
    client_id: '',
    deliverable_id: ''
  });

  const [journalLines, setJournalLines] = useState<JournalLine[]>([
    { account_id: '', account_name: '', debit: 0, credit: 0, description: '' },
    { account_id: '', account_name: '', debit: 0, credit: 0, description: '' }
  ]);

  const [submitting, setSubmitting] = useState(false);

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch deliverables for selected client
  const { data: deliverables = [] } = useQuery({
    queryKey: ['deliverables', formData.client_id],
    queryFn: async () => {
      if (!formData.client_id) return [];
      
      const { data, error } = await supabase
        .from('deliverables')
        .select('id, title')
        .eq('client_id', formData.client_id)
        .order('title');
      
      if (error) throw error;
      return data;
    },
    enabled: !!formData.client_id
  });

  // Fetch accounts (mock data for now)
  const mockAccounts = [
    { id: '1', name: 'Cash', code: '1001' },
    { id: '2', name: 'Bank - Current Account', code: '1002' },
    { id: '3', name: 'Accounts Receivable', code: '1201' },
    { id: '4', name: 'Accounts Payable', code: '2001' },
    { id: '5', name: 'Sales Revenue', code: '4001' },
    { id: '6', name: 'Cost of Goods Sold', code: '5001' },
    { id: '7', name: 'Office Expenses', code: '6001' },
    { id: '8', name: 'Professional Fees', code: '6002' }
  ];

  const calculateBalance = () => {
    const totalDebit = journalLines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = journalLines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return totalDebit - totalCredit;
  };

  const isBalanced = () => Math.abs(calculateBalance()) < 0.01;

  const addJournalLine = () => {
    setJournalLines([...journalLines, { account_id: '', account_name: '', debit: 0, credit: 0, description: '' }]);
  };

  const removeJournalLine = (index: number) => {
    if (journalLines.length > 2) {
      setJournalLines(journalLines.filter((_, i) => i !== index));
    }
  };

  const updateJournalLine = (index: number, field: keyof JournalLine, value: any) => {
    const updatedLines = [...journalLines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    
    // Update account name when account is selected
    if (field === 'account_id') {
      const account = mockAccounts.find(a => a.id === value);
      updatedLines[index].account_name = account ? `${account.code} - ${account.name}` : '';
    }
    
    setJournalLines(updatedLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isBalanced()) {
      toast.error('Journal entry must be balanced (debits = credits)');
      return;
    }

    if (journalLines.some(line => !line.account_id)) {
      toast.error('Please select an account for all journal lines');
      return;
    }

    setSubmitting(true);
    
    try {
      const totalAmount = journalLines.reduce((sum, line) => sum + Math.max(line.debit, line.credit), 0);
      
      await onSubmit({
        ...formData,
        amount: totalAmount,
        lines: journalLines,
        status: 'draft'
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${cycle.color} mr-2`} />
            Manual Entry - {cycle.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Transaction Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                  placeholder="Enter reference number"
                />
              </div>

              <div>
                <Label htmlFor="client">Client</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({...formData, client_id: value, deliverable_id: ''})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deliverable">Deliverable (Optional)</Label>
                <Select
                  value={formData.deliverable_id}
                  onValueChange={(value) => setFormData({...formData, deliverable_id: value})}
                  disabled={!formData.client_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deliverable" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliverables.map((deliverable) => (
                      <SelectItem key={deliverable.id} value={deliverable.id}>
                        {deliverable.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="narration">Description/Narration</Label>
                <Textarea
                  id="narration"
                  value={formData.narration}
                  onChange={(e) => setFormData({...formData, narration: e.target.value})}
                  placeholder="Enter transaction description"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Journal Lines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Journal Entries</CardTitle>
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span className={`font-mono text-sm ${isBalanced() ? 'text-green-600' : 'text-red-600'}`}>
                  Balance: ₹{calculateBalance().toFixed(2)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journalLines.map((line, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-4">
                      <Label>Account</Label>
                      <Select
                        value={line.account_id}
                        onValueChange={(value) => updateJournalLine(index, 'account_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label>Debit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={line.debit || ''}
                        onChange={(e) => updateJournalLine(index, 'debit', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Credit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={line.credit || ''}
                        onChange={(e) => updateJournalLine(index, 'credit', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-3">
                      <Label>Description</Label>
                      <Input
                        value={line.description}
                        onChange={(e) => updateJournalLine(index, 'description', e.target.value)}
                        placeholder="Line description"
                      />
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeJournalLine(index)}
                        disabled={journalLines.length <= 2}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addJournalLine}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Journal Line
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isBalanced() || submitting}
              className="min-w-[120px]"
            >
              {submitting ? 'Creating...' : 'Create Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualEntryModal;

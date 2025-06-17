
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useClientContext } from '@/hooks/useClientContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Report = Database['public']['Tables']['reports']['Row'];

interface AddEditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  onReportSaved: () => void;
}

const AddEditReportModal = ({ isOpen, onClose, report, onReportSaved }: AddEditReportModalProps) => {
  const { profile } = useAuth();
  const { availableClients } = useClientContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    report_type: 'trial_balance',
    period_start: '',
    period_end: '',
    notes: '',
    status: 'draft'
  });

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || '',
        client_id: report.client_id || '',
        report_type: report.report_type || 'trial_balance',
        period_start: report.period_start || '',
        period_end: report.period_end || '',
        notes: report.notes || '',
        status: report.status || 'draft'
      });
    } else {
      setFormData({
        title: '',
        client_id: '',
        report_type: 'trial_balance',
        period_start: '',
        period_end: '',
        notes: '',
        status: 'draft'
      });
    }
  }, [report]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reportData = {
        title: formData.title,
        client_id: formData.client_id,
        report_type: formData.report_type,
        period_start: formData.period_start || null,
        period_end: formData.period_end || null,
        notes: formData.notes || null,
        status: formData.status,
        firm_id: profile?.firm_id,
        business_id: profile?.user_group === 'business_owner' ? profile.business_id : null,
        created_by: profile?.id
      };

      if (report) {
        // Update existing report
        const { error } = await supabase
          .from('reports')
          .update(reportData)
          .eq('id', report.id);

        if (error) throw error;
        toast.success('Report updated successfully');
      } else {
        // Create new report
        const { error } = await supabase
          .from('reports')
          .insert([reportData]);

        if (error) throw error;
        toast.success('Report created successfully');
      }

      onReportSaved();
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{report ? 'Edit Report' : 'Generate New Report'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="client_id">Client *</Label>
              <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {availableClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="report_type">Report Type</Label>
              <Select value={formData.report_type} onValueChange={(value) => handleInputChange('report_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial_balance">Trial Balance</SelectItem>
                  <SelectItem value="profit_loss">P&L Statement</SelectItem>
                  <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                  <SelectItem value="cash_flow">Cash Flow Statement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="period_start">Period Start</Label>
              <Input
                id="period_start"
                type="date"
                value={formData.period_start}
                onChange={(e) => handleInputChange('period_start', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="period_end">Period End</Label>
              <Input
                id="period_end"
                type="date"
                value={formData.period_end}
                onChange={(e) => handleInputChange('period_end', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes / Commentary</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              placeholder="Add any notes or commentary about this report..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (report ? 'Update Report' : 'Generate Report')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditReportModal;

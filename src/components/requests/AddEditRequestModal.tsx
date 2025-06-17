
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

interface AddEditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSaved: () => void;
}

const AddEditRequestModal = ({ isOpen, onClose, onRequestSaved }: AddEditRequestModalProps) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    request_type: 'general',
    description: '',
    priority: 'normal'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        title: formData.title,
        request_type: formData.request_type,
        description: formData.description,
        priority: formData.priority,
        status: 'new',
        business_id: profile?.business_id,
        client_id: profile?.business_id, // For business owners, client_id = business_id
        created_by: profile?.id
      };

      const { error } = await supabase
        .from('requests')
        .insert([requestData]);

      if (error) throw error;
      
      toast.success('Request submitted successfully');
      onRequestSaved();
    } catch (error) {
      console.error('Error saving request:', error);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit New Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Request Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="request_type">Request Type</Label>
            <Select value={formData.request_type} onValueChange={(value) => handleInputChange('request_type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new_report">Request New Report</SelectItem>
                <SelectItem value="meeting">Request Meeting/Call</SelectItem>
                <SelectItem value="compliance_question">Compliance Question</SelectItem>
                <SelectItem value="invoice_query">Invoice Query</SelectItem>
                <SelectItem value="general">General Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={5}
              placeholder="Please provide detailed information about your request..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditRequestModal;

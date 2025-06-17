
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

type Deliverable = Database['public']['Tables']['deliverables']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

// Fix: Define proper type for team members
type TeamMember = {
  id: string;
  first_name: string;
  last_name: string;
  user_role: string;
};

interface AddEditDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliverable: Deliverable | null;
  onDeliverableSaved: () => void;
}

const AddEditDeliverableModal = ({ isOpen, onClose, deliverable, onDeliverableSaved }: AddEditDeliverableModalProps) => {
  const { profile } = useAuth();
  const { availableClients } = useClientContext();
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    deliverable_type: 'custom',
    frequency: 'one-time',
    due_date: '',
    assigned_to: '',
    description: '',
    priority: 'medium',
    status: 'pending'
  });

  useEffect(() => {
    if (profile?.user_group === 'accounting_firm' && profile?.firm_id) {
      fetchTeamMembers();
    }
  }, [profile]);

  useEffect(() => {
    if (deliverable) {
      setFormData({
        title: deliverable.title || '',
        client_id: deliverable.client_id || '',
        deliverable_type: deliverable.deliverable_type || 'custom',
        frequency: deliverable.frequency || 'one-time',
        due_date: deliverable.due_date || '',
        assigned_to: deliverable.assigned_to || '',
        description: deliverable.description || '',
        priority: deliverable.priority || 'medium',
        status: deliverable.status || 'pending'
      });
    } else {
      setFormData({
        title: '',
        client_id: '',
        deliverable_type: 'custom',
        frequency: 'one-time',
        due_date: '',
        assigned_to: '',
        description: '',
        priority: 'medium',
        status: 'pending'
      });
    }
  }, [deliverable]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_role')
        .eq('firm_id', profile?.firm_id)
        .in('user_role', ['staff', 'senior_staff'])
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }

      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const deliverableData = {
        title: formData.title,
        client_id: formData.client_id,
        deliverable_type: formData.deliverable_type,
        frequency: formData.frequency,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to || null,
        description: formData.description || null,
        priority: formData.priority,
        status: formData.status,
        firm_id: profile?.firm_id,
        business_id: profile?.user_group === 'business_owner' ? profile.business_id : null,
        created_by: profile?.id
      };

      if (deliverable) {
        // Update existing deliverable
        const { error } = await supabase
          .from('deliverables')
          .update(deliverableData)
          .eq('id', deliverable.id);

        if (error) throw error;
        toast.success('Deliverable updated successfully');
      } else {
        // Create new deliverable
        const { error } = await supabase
          .from('deliverables')
          .insert([deliverableData]);

        if (error) throw error;
        toast.success('Deliverable created successfully');
      }

      onDeliverableSaved();
    } catch (error) {
      console.error('Error saving deliverable:', error);
      toast.error('Failed to save deliverable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{deliverable ? 'Edit Deliverable' : 'Add New Deliverable'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
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
              <Label htmlFor="deliverable_type">Type</Label>
              <Select value={formData.deliverable_type} onValueChange={(value) => handleInputChange('deliverable_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p_and_l">P&L Statement</SelectItem>
                  <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                  <SelectItem value="cash_flow">Cash Flow</SelectItem>
                  <SelectItem value="gst_filing">GST Filing</SelectItem>
                  <SelectItem value="roc_filing">ROC Filing</SelectItem>
                  <SelectItem value="tax_return">Tax Return</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Select value={formData.assigned_to} onValueChange={(value) => handleInputChange('assigned_to', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} ({member.user_role})
                    </SelectItem>
                  ))}
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
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="data_received">Data Received</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (deliverable ? 'Update Deliverable' : 'Create Deliverable')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditDeliverableModal;

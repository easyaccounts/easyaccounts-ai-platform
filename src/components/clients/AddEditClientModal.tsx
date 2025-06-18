
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Client = Database['public']['Tables']['clients']['Row'];

interface AddEditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onClientSaved: () => void;
}

const AddEditClientModal = ({ isOpen, onClose, client, onClientSaved }: AddEditClientModalProps) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    pan_number: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    business_type: '',
    industry: '',
    monthly_fee: '',
    billing_cycle: 'monthly',
    status: 'active'
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        gstin: client.gstin || '',
        pan_number: client.pan_number || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        postal_code: client.postal_code || '',
        country: client.country || 'India',
        business_type: client.business_type || '',
        industry: client.industry || '',
        monthly_fee: client.monthly_fee?.toString() || '',
        billing_cycle: client.billing_cycle || 'monthly',
        status: client.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        gstin: '',
        pan_number: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        business_type: '',
        industry: '',
        monthly_fee: '',
        billing_cycle: 'monthly',
        status: 'active'
      });
    }
  }, [client, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.firm_id) {
      console.error('No firm ID available in profile:', profile);
      toast.error('Unable to create client - no firm ID available');
      return;
    }

    if (!profile?.id) {
      console.error('No user ID available in profile:', profile);
      toast.error('Unable to create client - not authenticated');
      return;
    }

    setLoading(true);

    try {
      const clientData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        gstin: formData.gstin || null,
        pan_number: formData.pan_number || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        postal_code: formData.postal_code || null,
        country: formData.country || null,
        business_type: formData.business_type || null,
        industry: formData.industry || null,
        monthly_fee: formData.monthly_fee ? parseFloat(formData.monthly_fee) : null,
        billing_cycle: formData.billing_cycle,
        status: formData.status,
        firm_id: profile.firm_id,
        created_by: profile.id
      };

      console.log('Creating/updating client with data:', clientData);

      if (client) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id);

        if (error) {
          console.error('Error updating client:', error);
          throw error;
        }
        toast.success('Client updated successfully');
      } else {
        // Create new client
        const { data, error } = await supabase
          .from('clients')
          .insert([clientData])
          .select()
          .single();

        if (error) {
          console.error('Error creating client:', error);
          throw error;
        }

        console.log('Client created successfully:', data);
        toast.success('Client created successfully');
      }

      onClientSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast.error(error.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                value={formData.gstin}
                onChange={(e) => handleInputChange('gstin', e.target.value)}
                maxLength={15}
              />
            </div>

            <div>
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input
                id="pan_number"
                value={formData.pan_number}
                onChange={(e) => handleInputChange('pan_number', e.target.value)}
                maxLength={10}
              />
            </div>

            <div>
              <Label htmlFor="business_type">Business Type</Label>
              <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private_limited">Private Limited</SelectItem>
                  <SelectItem value="llp">LLP</SelectItem>
                  <SelectItem value="proprietorship">Proprietorship</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="public_limited">Public Limited</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="monthly_fee">Monthly Fee (₹)</Label>
              <Input
                id="monthly_fee"
                type="number"
                value={formData.monthly_fee}
                onChange={(e) => handleInputChange('monthly_fee', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="billing_cycle">Billing Cycle</Label>
              <Select value={formData.billing_cycle} onValueChange={(value) => handleInputChange('billing_cycle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (client ? 'Update Client' : 'Create Client')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditClientModal;


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Database } from '@/integrations/supabase/types';
import { useUserContext } from '@/hooks/useUserContext';
import { toast } from '@/hooks/use-toast';

type Client = Database['public']['Tables']['clients']['Row'];

interface AddEditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onClientSaved: () => void;
  firmId: string | null;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  business_type: string;
  industry: string;
  monthly_fee: string;
  gst_number: string;
  pan_number: string;
  billing_cycle: string;
  status: string;
}

const AddEditClientModal = ({ 
  isOpen, 
  onClose, 
  client, 
  onClientSaved, 
  firmId, 
  onSubmit, 
  isSubmitting 
}: AddEditClientModalProps) => {
  const { firmId: contextFirmId } = useUserContext();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    business_type: '',
    industry: '',
    monthly_fee: '',
    gst_number: '',
    pan_number: '',
    billing_cycle: 'monthly',
    status: 'active',
  });

  useEffect(() => {
    if (isOpen) {
      const activeFirmId = firmId || contextFirmId;
      if (!activeFirmId && !client) {
        toast({
          title: 'Error',
          description: 'Firm context is required to add clients',
          variant: 'destructive',
        });
        onClose();
        return;
      }

      if (client) {
        setFormData({
          name: client.name || '',
          email: client.email || '',
          phone: client.phone || '',
          address: client.address || '',
          city: client.city || '',
          state: client.state || '',
          postal_code: client.postal_code || '',
          country: client.country || 'India',
          business_type: client.business_type || '',
          industry: client.industry || '',
          monthly_fee: client.monthly_fee?.toString() || '',
          gst_number: client.gst_number || '',
          pan_number: client.pan_number || '',
          billing_cycle: client.billing_cycle || 'monthly',
          status: client.status || 'active',
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, client, firmId, contextFirmId, onClose]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
      business_type: '',
      industry: '',
      monthly_fee: '',
      gst_number: '',
      pan_number: '',
      billing_cycle: 'monthly',
      status: 'active',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const activeFirmId = firmId || contextFirmId;
    if (!activeFirmId) {
      toast({
        title: 'Error',
        description: 'Firm ID is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onSubmit({
        id: client?.id,
        firm_id: activeFirmId,
        ...formData,
        monthly_fee: formData.monthly_fee ? parseFloat(formData.monthly_fee) : 0,
      });

      toast({
        title: 'Success',
        description: client ? 'Client updated successfully' : 'Client added successfully',
      });

      onClientSaved();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save client',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="monthly_fee">Monthly Fee (₹)</Label>
              <Input
                id="monthly_fee"
                type="number"
                value={formData.monthly_fee}
                onChange={(e) => setFormData(prev => ({ ...prev, monthly_fee: e.target.value }))}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_type">Business Type</Label>
              <Select value={formData.business_type} onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="private_limited">Private Limited</SelectItem>
                  <SelectItem value="public_limited">Public Limited</SelectItem>
                  <SelectItem value="llp">LLP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gst_number">GST Number</Label>
              <Input
                id="gst_number"
                value={formData.gst_number}
                onChange={(e) => setFormData(prev => ({ ...prev, gst_number: e.target.value }))}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
            <div>
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input
                id="pan_number"
                value={formData.pan_number}
                onChange={(e) => setFormData(prev => ({ ...prev, pan_number: e.target.value }))}
                placeholder="AAAAA0000A"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billing_cycle">Billing Cycle</Label>
              <Select value={formData.billing_cycle} onValueChange={(value) => setFormData(prev => ({ ...prev, billing_cycle: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditClientModal;

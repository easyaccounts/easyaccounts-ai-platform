import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from '@/hooks/useUserContext';
import { useClientManager } from '@/hooks/useClientManager';
import { Database } from '@/integrations/supabase/types';
import { UI_MESSAGES } from '@/utils/constants';

type Client = Database['public']['Tables']['clients']['Row'];

interface AddEditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onClientSaved: () => void;
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
  gstin: string;
  gst_number: string;
  pan_number: string;
  business_type: string;
  industry: string;
  monthly_fee: string;
  billing_cycle: 'monthly' | 'quarterly' | 'annually';
  status: 'active' | 'inactive';
}

const AddEditClientModal = ({ isOpen, onClose, client, onClientSaved }: AddEditClientModalProps) => {
  const { toast } = useToast();
  const { firmId } = useUserContext();
  const { createClient, updateClient, isCreating, isUpdating } = useClientManager();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    gstin: '',
    gst_number: '',
    pan_number: '',
    business_type: '',
    industry: '',
    monthly_fee: '',
    billing_cycle: 'monthly',
    status: 'active',
  });

  useEffect(() => {
    if (isOpen) {
      // Check if firmId is available for new clients
      if (!firmId && !client) {
        toast({
          title: 'Error',
          description: UI_MESSAGES.ERROR_FIRM_DETECTION,
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
          country: client.country || '',
          gstin: client.gstin || '',
          gst_number: client.gst_number || '',
          pan_number: client.pan_number || '',
          business_type: client.business_type || '',
          industry: client.industry || '',
          monthly_fee: client.monthly_fee?.toString() || '',
          billing_cycle: (client.billing_cycle as 'monthly' | 'quarterly' | 'annually') || 'monthly',
          status: (client.status as 'active' | 'inactive') || 'active',
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, client, firmId, toast, onClose]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      gstin: '',
      gst_number: '',
      pan_number: '',
      business_type: '',
      industry: '',
      monthly_fee: '',
      billing_cycle: 'monthly',
      status: 'active',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const clientData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postal_code: formData.postal_code || undefined,
        country: formData.country || undefined,
        gstin: formData.gstin || undefined,
        gst_number: formData.gst_number || undefined,
        pan_number: formData.pan_number || undefined,
        business_type: formData.business_type || undefined,
        industry: formData.industry || undefined,
        monthly_fee: formData.monthly_fee ? parseFloat(formData.monthly_fee) : undefined,
        billing_cycle: formData.billing_cycle,
        status: formData.status,
      };

      if (client) {
        // Update existing client
        await updateClient({
          id: client.id,
          ...clientData,
        });
      } else {
        // Validate firmId before creating new client
        if (!firmId) {
          throw new Error(UI_MESSAGES.ERROR_FIRM_DETECTION);
        }

        // Create new client with firm association
        await createClient({
          ...clientData,
          firm_id: firmId,
        });
      }

      onClientSaved();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast({
        title: 'Error',
        description: error.message || UI_MESSAGES.ERROR_GENERIC,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'Add Client'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Client Name *</Label>
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
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="society">Society</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Information</h3>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tax Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="gst_number">GST Number</Label>
                <Input
                  id="gst_number"
                  value={formData.gst_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, gst_number: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input
                id="pan_number"
                value={formData.pan_number}
                onChange={(e) => setFormData(prev => ({ ...prev, pan_number: e.target.value }))}
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="monthly_fee">Monthly Fee (₹)</Label>
                <Input
                  id="monthly_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_fee: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billing_cycle">Billing Cycle</Label>
                <Select value={formData.billing_cycle} onValueChange={(value: 'monthly' | 'quarterly' | 'annually') => setFormData(prev => ({ ...prev, billing_cycle: value }))}>
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
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}>
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
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? UI_MESSAGES.SAVING : client ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditClientModal;

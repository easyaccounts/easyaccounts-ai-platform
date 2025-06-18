
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Database } from '@/integrations/supabase/types';
import { UI_MESSAGES } from '@/utils/constants';
import { useUserContext } from '@/hooks/useUserContext';
import { toast } from '@/hooks/use-toast';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

interface AddEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: Profile | null;
  onUserUpdated: () => void;
  firmId: string | null;
  clients: Client[];
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  user_role: 'senior_staff' | 'staff';
  status: 'active' | 'inactive';
}

const AddEditUserModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onUserUpdated, 
  firmId, 
  clients, 
  onSubmit, 
  isSubmitting 
}: AddEditUserModalProps) => {
  const { firmId: contextFirmId } = useUserContext();
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    user_role: 'staff',
    status: 'active',
  });
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const activeFirmId = firmId || contextFirmId;
      if (!activeFirmId && !user) {
        toast({
          title: 'Error',
          description: 'Firm context is required to add team members',
          variant: 'destructive',
        });
        onClose();
        return;
      }

      if (user) {
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          user_role: (user.user_role as 'senior_staff' | 'staff') || 'staff',
          status: (user.status as 'active' | 'inactive') || 'active',
        });
        setSelectedClients([]);
      } else {
        resetForm();
      }
    }
  }, [isOpen, user, firmId, contextFirmId, onClose]);

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      user_role: 'staff',
      status: 'active',
    });
    setSelectedClients([]);
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

    console.log('Submitting team member data:', {
      ...formData,
      firm_id: activeFirmId,
      user_group: 'accounting_firm',
      selectedClients,
    });

    try {
      await onSubmit({
        id: user?.id,
        ...formData,
        firm_id: activeFirmId,
        user_group: 'accounting_firm',
        selectedClients,
      });

      onUserUpdated();
      resetForm();
    } catch (error: any) {
      console.error('Error saving user:', error);
      // Error is handled in the mutation
    }
  };

  const handleClientToggle = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={!!user}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_role">Role *</Label>
              <Select value={formData.user_role} onValueChange={(value: 'senior_staff' | 'staff') => setFormData(prev => ({ ...prev, user_role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="senior_staff">Senior Staff</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
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

          {clients.length > 0 && (
            <div>
              <Label>Assigned Clients</Label>
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={client.id}
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={(checked) => handleClientToggle(client.id, checked as boolean)}
                    />
                    <Label htmlFor={client.id} className="text-sm font-normal">
                      {client.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : user ? 'Update Team Member' : 'Add Team Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditUserModal;

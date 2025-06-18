
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

interface AddEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: Profile | null;
  onUserUpdated: () => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  user_role: 'senior_staff' | 'staff';
  status: 'active' | 'inactive';
}

const AddEditUserModal = ({ isOpen, onClose, user, onUserUpdated }: AddEditUserModalProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { firmId } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    user_role: 'staff',
    status: 'active',
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Check if firmId is available
      if (!firmId && !user) {
        toast({
          title: 'Error',
          description: 'Unable to detect your firm — please refresh or contact support.',
          variant: 'destructive',
        });
        onClose();
        return;
      }

      fetchClients();
      if (user) {
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          user_role: (user.user_role as 'senior_staff' | 'staff') || 'staff',
          status: (user.status as 'active' | 'inactive') || 'active',
        });
        fetchUserAssignments(user.id);
      } else {
        resetForm();
      }
    }
  }, [isOpen, user, firmId]);

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

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('firm_id', firmId)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch clients',
        variant: 'destructive',
      });
    }
  };

  const fetchUserAssignments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_assignments')
        .select('client_id')
        .eq('user_id', userId);

      if (error) throw error;
      setSelectedClients(data?.map(assignment => assignment.client_id) || []);
    } catch (error) {
      console.error('Error fetching user assignments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            user_role: formData.user_role,
            status: formData.status,
          })
          .eq('id', user.id);

        if (error) throw error;
        await updateUserAssignments(user.id);
      } else {
        // Validate firmId before creating new user
        if (!firmId) {
          throw new Error('Unable to detect your firm — please refresh or contact support.');
        }

        // Create new team member profile directly
        const newUserId = crypto.randomUUID();
        
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: newUserId,
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            user_role: formData.user_role,
            user_group: 'accounting_firm' as const,
            firm_id: firmId,
            status: formData.status,
          });

        if (error) throw error;
        
        // Create assignments for the new user
        if (selectedClients.length > 0) {
          await updateUserAssignments(newUserId);
        }
      }

      toast({
        title: 'Success',
        description: user ? 'User updated successfully' : 'Team member created successfully',
      });

      onUserUpdated();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserAssignments = async (userId: string) => {
    // Delete existing assignments
    const { error: deleteError } = await supabase
      .from('user_assignments')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Insert new assignments
    if (selectedClients.length > 0) {
      const assignments = selectedClients.map(clientId => ({
        user_id: userId,
        client_id: clientId,
        assigned_by: profile?.id,
      }));

      const { error } = await supabase
        .from('user_assignments')
        .insert(assignments);

      if (error) throw error;
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
          <DialogTitle>{user ? 'Edit User' : 'Add Team Member'}</DialogTitle>
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update User' : 'Add Team Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditUserModal;

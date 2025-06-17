
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  user_role: string;
  status: string;
}

interface AddEditUserModalProps {
  open: boolean;
  onClose: () => void;
  user?: TeamMember | null;
  firmId?: string;
}

const AddEditUserModal = ({ open, onClose, user, firmId }: AddEditUserModalProps) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    user_role: 'staff' as const,
    status: 'active' as const,
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
      if (user) {
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          user_role: user.user_role as 'staff' | 'senior_staff',
          status: user.status as 'active' | 'inactive',
        });
        fetchUserAssignments(user.id);
      } else {
        resetForm();
      }
    }
  }, [open, user]);

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
      setLoadingClients(true);
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('firm_id', firmId)
        .order('name');

      if (error) {
        console.error('Error fetching clients:', error);
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchUserAssignments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_assignments')
        .select('client_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user assignments:', error);
        return;
      }

      setSelectedClients(data?.map(a => a.client_id) || []);
    } catch (error) {
      console.error('Error fetching user assignments:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      if (user) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            user_role: formData.user_role,
            status: formData.status,
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating user:', updateError);
          toast.error('Failed to update user');
          return;
        }

        // Update client assignments
        await updateUserAssignments(user.id);
        
        toast.success('User updated successfully');
      } else {
        // Create new user via auth.admin.createUser would require service role
        // For now, we'll just show a message that they need to sign up
        toast.info('New users need to sign up themselves. Share the signup link with them.');
      }

      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const updateUserAssignments = async (userId: string) => {
    try {
      // Delete existing assignments
      await supabase
        .from('user_assignments')
        .delete()
        .eq('user_id', userId);

      // Insert new assignments
      if (selectedClients.length > 0) {
        const currentUser = await supabase.auth.getUser();
        const assignments = selectedClients.map(clientId => ({
          user_id: userId,
          client_id: clientId,
          assigned_by: currentUser.data.user?.id,
        }));

        const { error } = await supabase
          .from('user_assignments')
          .insert(assignments);

        if (error) {
          console.error('Error updating assignments:', error);
        }
      }
    } catch (error) {
      console.error('Error updating assignments:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Edit Team Member' : 'Add Team Member'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={!!user} // Don't allow email changes for existing users
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_role">Role</Label>
              <Select value={formData.user_role} onValueChange={(value: 'senior_staff' | 'staff') => handleInputChange('user_role', value)}>
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
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}>
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
            <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
              {loadingClients ? (
                <p className="text-sm text-muted-foreground">Loading clients...</p>
              ) : clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients available</p>
              ) : (
                <div className="space-y-2">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={client.id}
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={() => handleClientToggle(client.id)}
                      />
                      <Label htmlFor={client.id} className="text-sm">
                        {client.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditUserModal;

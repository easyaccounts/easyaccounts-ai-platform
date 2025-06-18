
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

// Security: Input validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
  return phone === '' || phoneRegex.test(phone);
};

const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name);
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Security: Generate secure random password
const generateSecurePassword = (): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const AddEditUserModal = ({ isOpen, onClose, user, onUserUpdated }: AddEditUserModalProps) => {
  const { toast } = useToast();
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
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, user]);

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
    setFormErrors({});
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch clients. Please try again.',
          variant: 'destructive',
        });
      } else {
        setClients(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching clients:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
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

      if (error) {
        console.error('Error fetching user assignments:', error);
      } else {
        setSelectedClients(data?.map(assignment => assignment.client_id) || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching user assignments:', error);
    }
  };

  // Security: Comprehensive input validation
  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!validateName(formData.first_name)) {
      errors.first_name = 'First name must be 2-50 characters, letters only';
    }

    if (!validateName(formData.last_name)) {
      errors.last_name = 'Last name must be 2-50 characters, letters only';
    }

    if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Security: Sanitize input
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClientToggle = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security: Validate form before submission
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (user) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            user_role: formData.user_role,
            status: formData.status,
          })
          .eq('id', user.id);

        if (error) throw error;

        await updateUserAssignments(user.id);

        toast({
          title: 'Success',
          description: 'User updated successfully.',
        });
      } else {
        // Security: Generate secure random password instead of hardcoded one
        const securePassword = generateSecurePassword();
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: securePassword,
          options: {
            data: {
              first_name: formData.first_name,
              last_name: formData.last_name,
              user_role: formData.user_role,
              user_group: 'accounting_firm',
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Update profile with additional fields
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              phone: formData.phone,
              status: formData.status,
            })
            .eq('id', authData.user.id);

          if (profileError) throw profileError;

          await updateUserAssignments(authData.user.id);
        }

        toast({
          title: 'Success',
          description: 'User created successfully. They will receive an email to set their password.',
        });
      }

      onUserUpdated();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save user. Please try again.',
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
      const currentUser = await supabase.auth.getUser();
      const assignments = selectedClients.map(clientId => ({
        user_id: userId,
        client_id: clientId,
        assigned_by: currentUser.data.user?.id,
      }));

      const { error } = await supabase
        .from('user_assignments')
        .insert(assignments);

      if (error) throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
                maxLength={50}
                className={formErrors.first_name ? 'border-red-500' : ''}
              />
              {formErrors.first_name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.first_name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
                maxLength={50}
                className={formErrors.last_name ? 'border-red-500' : ''}
              />
              {formErrors.last_name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.last_name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={!!user}
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                maxLength={15}
                className={formErrors.phone ? 'border-red-500' : ''}
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_role">Role *</Label>
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
              <Label htmlFor="status">Status *</Label>
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
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditUserModal;

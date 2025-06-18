
import React, { useState } from 'react';
import { useTeamManager } from '@/hooks/useTeamManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, UserPlus } from 'lucide-react';
import AddEditUserModal from '@/components/team/AddEditUserModal';
import { useUserContext } from '@/hooks/useUserContext';
import { toast } from '@/hooks/use-toast';

const TeamManagement = () => {
  const { 
    teamMembers, 
    clients, 
    isLoading, 
    refreshTeamMembers, 
    createTeamMember, 
    updateTeamMember, 
    isCreating, 
    isUpdating 
  } = useTeamManager();
  const { firmId } = useUserContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleAddUser = () => {
    if (!firmId) {
      toast({
        title: 'Error',
        description: 'Firm context is required to add team members',
        variant: 'destructive',
      });
      return;
    }
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleUserUpdated = () => {
    refreshTeamMembers();
    handleModalClose();
  };

  const handleSaveUser = async (data: any) => {
    try {
      if (editingUser) {
        await updateTeamMember({ ...data, id: editingUser.id });
      } else {
        await createTeamMember({ ...data, firm_id: firmId });
      }
    } catch (error: any) {
      console.error('Error saving team member:', error);
      throw error;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'partner': return 'default';
      case 'senior_staff': return 'secondary';
      case 'staff': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">
              Manage your firm's team members and their roles
            </p>
          </div>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>
        <div className="text-center py-8">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your firm's team members and their roles
          </p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Team Members
          </CardTitle>
          <CardDescription>All team members in your firm</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-500 mb-4">
                Add your first team member to get started with collaboration.
              </p>
              <Button onClick={handleAddUser}>
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {member.first_name} {member.last_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(member.user_role)}>
                        {member.user_role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'destructive'}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddEditUserModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        user={editingUser}
        onUserUpdated={handleUserUpdated}
        firmId={firmId}
        clients={clients}
        onSubmit={handleSaveUser}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
};

export default TeamManagement;

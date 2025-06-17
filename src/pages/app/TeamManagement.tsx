
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Edit, UserX } from 'lucide-react';
import { toast } from 'sonner';
import AddEditUserModal from '@/components/team/AddEditUserModal';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface TeamMember extends Profile {
  assigned_clients: Array<{ name: string }>;
}

const TeamManagement = () => {
  const { profile } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (profile?.user_role === 'partner' && profile?.firm_id) {
      fetchTeamMembers();
    }
  }, [profile]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      // Fetch team members from the same firm
      const { data: members, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          user_role,
          status,
          user_group,
          firm_id,
          business_id,
          firm_name,
          business_name,
          created_at,
          updated_at
        `)
        .eq('firm_id', profile?.firm_id)
        .neq('id', profile?.id); // Exclude current user

      if (error) {
        console.error('Error fetching team members:', error);
        toast.error('Failed to fetch team members');
        return;
      }

      // Fetch assigned clients for each team member
      const membersWithClients = await Promise.all(
        (members || []).map(async (member) => {
          const { data: assignments } = await supabase
            .from('user_assignments')
            .select(`
              client_id,
              clients (name)
            `)
            .eq('user_id', member.id);

          return {
            ...member,
            assigned_clients: assignments?.map(a => ({ name: a.clients?.name || '' })) || []
          };
        })
      );

      setTeamMembers(membersWithClients);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', userId);

      if (error) {
        console.error('Error deactivating user:', error);
        toast.error('Failed to deactivate user');
        return;
      }

      toast.success('User deactivated successfully');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Failed to deactivate user');
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user: TeamMember) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingUser(null);
    fetchTeamMembers();
  };

  // Check if user has permission to access this page
  if (profile?.user_role !== 'partner' || profile?.user_group !== 'accounting_firm') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to access team management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your firm's team members and assignments</p>
        </div>
        <Button onClick={handleAddUser}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading team members...</div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members found. Add your first team member to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Clients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      {member.first_name} {member.last_name}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {member.user_role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.assigned_clients.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {member.assigned_clients.slice(0, 2).map((client, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {client.name}
                            </Badge>
                          ))}
                          {member.assigned_clients.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.assigned_clients.length - 2} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No assignments</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'destructive'}>
                        {member.status}
                      </Badge>
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
                        {member.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivateUser(member.id)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
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
        open={modalOpen}
        onClose={handleModalClose}
        user={editingUser}
        firmId={profile?.firm_id}
      />
    </div>
  );
};

export default TeamManagement;

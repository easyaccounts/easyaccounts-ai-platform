
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Building2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type TeamClientAssignment = Database['public']['Tables']['team_client_assignments']['Row'];

interface TeamMember extends Profile {
  assignments: Array<{ client: Client; assignment: TeamClientAssignment }>;
}

const AssignClients = () => {
  const { profile } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (profile?.user_role === 'partner' && profile?.firm_id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch team members (seniors and staff from the same firm)
      const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('firm_id', profile?.firm_id)
        .in('user_role', ['senior_staff', 'staff'])
        .eq('status', 'active');

      if (membersError) throw membersError;

      // Fetch all firm clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('firm_id', profile?.firm_id)
        .order('name');

      if (clientsError) throw clientsError;

      // Fetch existing assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('team_client_assignments')
        .select(`
          *,
          client:clients(*),
          team_member:profiles(*)
        `)
        .eq('assigned_by', profile?.id);

      if (assignmentsError) throw assignmentsError;

      // Group assignments by team member
      const membersWithAssignments = (members || []).map(member => ({
        ...member,
        assignments: (assignments || [])
          .filter(a => a.team_member_id === member.id)
          .map(a => ({ client: a.client, assignment: a }))
      }));

      setTeamMembers(membersWithAssignments);
      setAvailableClients(clients || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClients = async () => {
    if (!selectedMember || selectedClients.length === 0) {
      toast.error('Please select a team member and at least one client');
      return;
    }

    try {
      setAssigning(true);

      const assignments = selectedClients.map(clientId => ({
        team_member_id: selectedMember,
        client_id: clientId,
        assigned_by: profile?.id
      }));

      const { error } = await supabase
        .from('team_client_assignments')
        .insert(assignments);

      if (error) throw error;

      toast.success(`Successfully assigned ${selectedClients.length} client(s)`);
      setSelectedMember('');
      setSelectedClients([]);
      fetchData();
    } catch (error) {
      console.error('Error assigning clients:', error);
      toast.error('Failed to assign clients');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('team_client_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Assignment removed successfully');
      fetchData();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  const getAvailableClientsForMember = () => {
    if (!selectedMember) return [];
    
    const memberAssignments = teamMembers
      .find(m => m.id === selectedMember)
      ?.assignments.map(a => a.client.id) || [];
    
    return availableClients.filter(client => 
      !memberAssignments.includes(client.id)
    );
  };

  // Check if user has permission to access this page
  if (profile?.user_role !== 'partner' || profile?.user_group !== 'accounting_firm') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to assign clients to team members.
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
          <h1 className="text-2xl font-bold">Assign Clients to Team</h1>
          <p className="text-muted-foreground">
            Manage client assignments for your team members
          </p>
        </div>
      </div>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>New Assignment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Team Member
              </label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team member" />
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
              <label className="text-sm font-medium mb-2 block">
                Select Clients
              </label>
              <Select
                value=""
                onValueChange={(clientId) => {
                  if (!selectedClients.includes(clientId)) {
                    setSelectedClients([...selectedClients, clientId]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add clients" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableClientsForMember().map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedClients.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Selected Clients ({selectedClients.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedClients.map((clientId) => {
                  const client = availableClients.find(c => c.id === clientId);
                  return (
                    <Badge key={clientId} variant="secondary" className="flex items-center space-x-1">
                      <span>{client?.name}</span>
                      <button
                        onClick={() => setSelectedClients(selectedClients.filter(id => id !== clientId))}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <Button 
            onClick={handleAssignClients}
            disabled={!selectedMember || selectedClients.length === 0 || assigning}
            className="w-full md:w-auto"
          >
            {assigning ? 'Assigning...' : `Assign ${selectedClients.length || ''} Client(s)`}
          </Button>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Current Assignments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading assignments...</div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members found. Add team members first.
            </div>
          ) : (
            <div className="space-y-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">
                        {member.first_name} {member.last_name}
                      </h3>
                      <Badge variant="outline">{member.user_role}</Badge>
                    </div>
                    <Badge variant="secondary">
                      {member.assignments.length} clients assigned
                    </Badge>
                  </div>

                  {member.assignments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client Name</TableHead>
                          <TableHead>Industry</TableHead>
                          <TableHead>Assigned Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {member.assignments.map(({ client, assignment }) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-blue-600" />
                              <span>{client.name}</span>
                            </TableCell>
                            <TableCell>{client.industry || 'N/A'}</TableCell>
                            <TableCell>
                              {new Date(assignment.assigned_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAssignment(assignment.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No clients assigned yet
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignClients;

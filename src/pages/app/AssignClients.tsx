
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Users, Building2 } from 'lucide-react';
import { useTeamManager } from '@/hooks/useTeamManager';

const AssignClients = () => {
  const { teamMembers, clients, assignments, isLoading, assignClient, isAssigning } = useTeamManager();
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedTeamMember, setSelectedTeamMember] = useState('');

  const handleAssignment = () => {
    if (selectedClient && selectedTeamMember) {
      assignClient({ 
        clientId: selectedClient, 
        teamMemberId: selectedTeamMember 
      });
      setSelectedClient('');
      setSelectedTeamMember('');
    }
  };

  const getAssignmentsByClient = () => {
    return assignments.reduce((acc, assignment) => {
      acc[assignment.client_id] = assignment;
      return acc;
    }, {} as Record<string, any>);
  };

  const clientAssignments = getAssignmentsByClient();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assign Clients</h1>
          <p className="text-muted-foreground">
            Assign team members to client accounts
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading data...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Assignment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                New Assignment
              </CardTitle>
              <CardDescription>
                Assign a client to a team member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Client</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Team Member</label>
                <Select value={selectedTeamMember} onValueChange={setSelectedTeamMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers
                      .filter(member => member.user_role !== 'partner')
                      .map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.first_name} {member.last_name} - {member.user_role.replace('_', ' ')}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAssignment}
                disabled={!selectedClient || !selectedTeamMember || isAssigning}
                className="w-full"
              >
                {isAssigning ? 'Assigning...' : 'Assign Client'}
              </Button>
            </CardContent>
          </Card>

          {/* Current Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Current Assignments
              </CardTitle>
              <CardDescription>
                Overview of existing client assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clients.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No clients available
                  </div>
                ) : (
                  clients.map((client) => {
                    const assignment = clientAssignments[client.id];
                    return (
                      <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {assignment 
                                ? `Assigned to ${assignment.profiles?.first_name} ${assignment.profiles?.last_name}`
                                : 'Unassigned'
                              }
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          {assignment ? 'Reassign' : 'Assign'}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AssignClients;

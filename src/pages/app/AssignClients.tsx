
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTeamManager } from '@/hooks/useTeamManager';
import { Badge } from '@/components/ui/badge';
import { Users, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AssignClients = () => {
  const { teamMembers, clients, assignments, assignClient, isAssigning } = useTeamManager();
  const [selectedAssignments, setSelectedAssignments] = useState<{[key: string]: string[]}>({});

  const handleTeamMemberToggle = (teamMemberId: string, clientId: string, checked: boolean) => {
    setSelectedAssignments(prev => {
      const current = prev[teamMemberId] || [];
      if (checked) {
        return {
          ...prev,
          [teamMemberId]: [...current, clientId]
        };
      } else {
        return {
          ...prev,
          [teamMemberId]: current.filter(id => id !== clientId)
        };
      }
    });
  };

  const handleSaveAssignments = async () => {
    try {
      for (const [teamMemberId, clientIds] of Object.entries(selectedAssignments)) {
        for (const clientId of clientIds) {
          // Check if assignment already exists
          const existingAssignment = assignments.find(
            a => a.team_member_id === teamMemberId && a.client_id === clientId
          );
          
          if (!existingAssignment) {
            await assignClient({ teamMemberId, clientId });
          }
        }
      }
      
      toast({
        title: 'Success',
        description: 'Client assignments updated successfully',
      });
      
      setSelectedAssignments({});
    } catch (error) {
      console.error('Error saving assignments:', error);
    }
  };

  const getAssignedClients = (teamMemberId: string) => {
    return assignments
      .filter(a => a.team_member_id === teamMemberId)
      .map(a => a.client_id);
  };

  const isClientAssigned = (teamMemberId: string, clientId: string) => {
    const assignedClients = getAssignedClients(teamMemberId);
    const selectedClients = selectedAssignments[teamMemberId] || [];
    return assignedClients.includes(clientId) || selectedClients.includes(clientId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Assign Clients</h1>
          <p className="text-muted-foreground">
            Assign clients to team members for project management
          </p>
        </div>
        <Button 
          onClick={handleSaveAssignments}
          disabled={isAssigning || Object.keys(selectedAssignments).length === 0}
        >
          {isAssigning ? 'Saving...' : 'Save Assignments'}
        </Button>
      </div>

      {teamMembers.length === 0 || clients.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              {teamMembers.length === 0 && (
                <div className="mb-4">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-600">No team members found. Add team members first.</p>
                </div>
              )}
              {clients.length === 0 && (
                <div>
                  <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-600">No clients found. Add clients first.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {teamMembers
            .filter(member => member.user_role !== 'partner')
            .map((teamMember) => (
            <Card key={teamMember.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{teamMember.first_name} {teamMember.last_name}</span>
                  <Badge variant="outline">
                    {teamMember.user_role.replace('_', ' ')}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Currently assigned to {getAssignedClients(teamMember.id).length} clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${teamMember.id}-${client.id}`}
                        checked={isClientAssigned(teamMember.id, client.id)}
                        onCheckedChange={(checked) => 
                          handleTeamMemberToggle(teamMember.id, client.id, checked as boolean)
                        }
                        disabled={getAssignedClients(teamMember.id).includes(client.id)}
                      />
                      <label 
                        htmlFor={`${teamMember.id}-${client.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {client.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignClients;

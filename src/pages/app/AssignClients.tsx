
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Users, Building2 } from 'lucide-react';

const AssignClients = () => {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedTeamMember, setSelectedTeamMember] = useState('');

  // Mock data - in real app this would come from Supabase
  const clients = [
    { id: '1', name: 'ABC Corp' },
    { id: '2', name: 'XYZ Ltd' },
    { id: '3', name: 'Tech Solutions' },
  ];

  const teamMembers = [
    { id: '1', name: 'John Smith', role: 'Senior Accountant' },
    { id: '2', name: 'Sarah Johnson', role: 'Staff Accountant' },
    { id: '3', name: 'Mike Brown', role: 'Senior Accountant' },
  ];

  const handleAssignment = () => {
    if (selectedClient && selectedTeamMember) {
      // TODO: Implement actual assignment logic with Supabase
      console.log('Assigning client:', selectedClient, 'to team member:', selectedTeamMember);
      alert('Client assigned successfully!');
      setSelectedClient('');
      setSelectedTeamMember('');
    }
  };

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
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAssignment}
              disabled={!selectedClient || !selectedTeamMember}
              className="w-full"
            >
              Assign Client
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
              {/* Mock current assignments */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">ABC Corp</p>
                    <p className="text-sm text-muted-foreground">Assigned to John Smith</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Reassign</Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">XYZ Ltd</p>
                    <p className="text-sm text-muted-foreground">Assigned to Sarah Johnson</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Reassign</Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="font-medium">Tech Solutions</p>
                    <p className="text-sm text-muted-foreground">Unassigned</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Assign</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssignClients;

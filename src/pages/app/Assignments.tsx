
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck } from 'lucide-react';
import { useTeamManager } from '@/hooks/useTeamManager';
import { Badge } from '@/components/ui/badge';

const Assignments = () => {
  const { assignments, isLoading } = useTeamManager();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Assignments</h1>
          <p className="text-muted-foreground">
            View all client and team member assignments.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Assignment Overview
          </CardTitle>
          <CardDescription>
            A list of all clients and the team members assigned to them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No assignments have been made yet. Go to "Team Management" to start assigning clients to team members.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.clients?.name}</TableCell>
                    <TableCell>{`${assignment.profiles?.first_name} ${assignment.profiles?.last_name}`}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{assignment.profiles?.user_role?.replace('_', ' ')}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Assignments;

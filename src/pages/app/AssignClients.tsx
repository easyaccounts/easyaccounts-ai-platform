
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

const AssignClients = () => {
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Client Assignments
          </CardTitle>
          <CardDescription>
            Manage team member assignments to client accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-gray-500">
            🚧 This module is under construction.
            <p className="mt-2 text-sm">Client assignment functionality will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignClients;

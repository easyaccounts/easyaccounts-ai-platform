
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

const Assignments = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Assignments</h1>
          <p className="text-muted-foreground">
            Assign team members to clients and manage workload
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Assignment Management
          </CardTitle>
          <CardDescription>
            Team and client assignment coordination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-gray-500">
            🚧 This module is under construction.
            <p className="mt-2 text-sm">Assignment functionality will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assignments;

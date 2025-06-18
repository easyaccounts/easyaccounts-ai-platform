
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

const ClientTasks = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">
            Complete your business tasks and requirements
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="w-5 h-5 mr-2" />
            Client Tasks
          </CardTitle>
          <CardDescription>
            Tasks assigned to your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-gray-500">
            🚧 This module is under construction.
            <p className="mt-2 text-sm">Client task functionality will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientTasks;

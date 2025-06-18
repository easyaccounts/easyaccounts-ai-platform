
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ClientRequests = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Requests</h1>
          <p className="text-muted-foreground">
            Submit and track your requests
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>All requests submitted by your business</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No requests found</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientRequests;

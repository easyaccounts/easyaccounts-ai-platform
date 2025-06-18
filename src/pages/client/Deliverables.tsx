
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ClientDeliverables = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deliverables</h1>
          <p className="text-muted-foreground">
            View and track your deliverables
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Deliverables</CardTitle>
          <CardDescription>All deliverables assigned to your business</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No deliverables found</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDeliverables;

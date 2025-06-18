
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ClientDocuments = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your business documents
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>All documents related to your business</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No documents found</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDocuments;

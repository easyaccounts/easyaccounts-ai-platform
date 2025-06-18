
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

const ClientUploads = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Uploads</h1>
          <p className="text-muted-foreground">
            Upload documents and files for your accounting team
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Upload receipts, invoices, and other financial documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-gray-500">
            🚧 This module is under construction.
            <p className="mt-2 text-sm">Document upload functionality will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientUploads;

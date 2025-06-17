
import React from 'react';
import { useClientContext } from '@/hooks/useClientContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from 'lucide-react';

const ClientViewBanner = () => {
  const { selectedClient } = useClientContext();

  if (!selectedClient) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50 text-blue-800 rounded-none border-x-0">
      <User className="h-4 w-4" />
      <AlertDescription className="font-medium">
        You are viewing data for <strong>{selectedClient.name}</strong>
      </AlertDescription>
    </Alert>
  );
};

export default ClientViewBanner;

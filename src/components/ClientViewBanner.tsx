
import React from 'react';
import { useUserContext } from '@/hooks/useUserContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from 'lucide-react';

const ClientViewBanner = () => {
  const { selectedClient } = useUserContext();

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

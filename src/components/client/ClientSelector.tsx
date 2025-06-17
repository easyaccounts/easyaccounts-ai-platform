
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, User } from 'lucide-react';
import { useClientContext } from '@/hooks/useClientContext';

const ClientSelector = () => {
  const { selectedClient, setSelectedClient, availableClients, loading } = useClientContext();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Building2 className="w-4 h-4" />
        <span className="text-sm">Loading clients...</span>
      </div>
    );
  }

  if (availableClients.length === 0) {
    return (
      <Badge variant="outline" className="flex items-center space-x-1">
        <User className="w-3 h-3" />
        <span>No clients available</span>
      </Badge>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Building2 className="w-4 h-4 text-blue-600" />
      <Select
        value={selectedClient?.id || ''}
        onValueChange={(value) => {
          const client = availableClients.find(c => c.id === value);
          setSelectedClient(client || null);
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {availableClients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientSelector;

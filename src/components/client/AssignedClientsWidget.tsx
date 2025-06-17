
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Eye } from 'lucide-react';
import { useClientAssignments } from '@/hooks/useClientAssignments';
import { useAuth } from '@/hooks/useAuth';
import { useClientContext } from '@/hooks/useClientContext';
import { Button } from '@/components/ui/button';

const AssignedClientsWidget = () => {
  const { profile } = useAuth();
  const { assignedClients, loading } = useClientAssignments();
  const { setSelectedClient } = useClientContext();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Loading Clients...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading your assigned clients...</div>
        </CardContent>
      </Card>
    );
  }

  const getWidgetTitle = () => {
    if (profile?.user_role === 'partner') return 'Firm Clients';
    return 'Assigned Clients';
  };

  const getWidgetDescription = () => {
    if (profile?.user_role === 'partner') {
      return `All ${assignedClients.length} clients in your firm`;
    }
    return `${assignedClients.length} clients assigned to you`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>{getWidgetTitle()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {getWidgetDescription()}
            </p>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{assignedClients.length}</span>
            </Badge>
          </div>

          {assignedClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {profile?.user_role === 'partner' 
                ? 'No clients in your firm yet' 
                : 'No clients assigned to you yet'
              }
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {assignedClients.slice(0, 10).map((client) => (
                <div 
                  key={client.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{client.name}</p>
                      {client.industry && (
                        <p className="text-xs text-muted-foreground">{client.industry}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedClient(client)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {assignedClients.length > 10 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  And {assignedClients.length - 10} more clients...
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignedClientsWidget;

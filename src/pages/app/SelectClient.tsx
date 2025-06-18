
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '@/hooks/useUserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';

const SelectClient = () => {
  const navigate = useNavigate();
  const { availableClients, setCurrentClient, loading } = useUserContext();

  const handleClientSelect = (clientId: string) => {
    setCurrentClient(clientId);
    navigate('/client/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select Client</h1>
        <p className="text-muted-foreground">
          Choose a client to view their dashboard and manage their accounting needs.
        </p>
      </div>

      {availableClients.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-muted-foreground">No Clients Available</CardTitle>
            <CardDescription className="text-center">
              You don't have access to any clients yet. Contact your administrator to get assigned to clients.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/app/dashboard')} variant="outline">
              Return to Firm Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  {client.name}
                </CardTitle>
                <CardDescription>
                  {client.business_type || 'Business Client'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleClientSelect(client.id)}
                  className="w-full"
                >
                  Select Client
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectClient;


import React, { useState } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientManager } from '@/hooks/useClientManager';
import { useUserContext } from '@/hooks/useUserContext';
import AddEditClientModal from '@/components/clients/AddEditClientModal';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { toast } from '@/hooks/use-toast';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const { firmId } = useUserContext();
  const { 
    clients, 
    isLoading, 
    createClient, 
    updateClient, 
    deleteClient,
    isCreating,
    isUpdating,
    isDeleting
  } = useClientManager({ searchTerm, statusFilter });

  const handleAddClient = () => {
    if (!firmId) {
      toast({
        title: 'Error',
        description: 'Firm context is required to add clients',
        variant: 'destructive',
      });
      return;
    }
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleClientSaved = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleSaveClient = async (data) => {
    try {
      if (selectedClient) {
        await updateClient({ ...data, id: selectedClient.id });
      } else {
        await createClient(data);
      }
    } catch (error: any) {
      console.error('Error saving client:', error);
      throw error;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
        <TableSkeleton columns={4} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Button onClick={handleAddClient}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Add your first client to get started with managing your business relationships.'
              }
            </p>
            <Button onClick={handleAddClient}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  {client.email && (
                    <p>📧 {client.email}</p>
                  )}
                  {client.phone && (
                    <p>📞 {client.phone}</p>
                  )}
                  {client.monthly_fee && (
                    <p className="font-semibold text-green-600">
                      💰 {formatCurrency(client.monthly_fee)}/month
                    </p>
                  )}
                  {client.gst_number && (
                    <p>GST: {client.gst_number}</p>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditClient(client)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteClient(client.id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddEditClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={selectedClient}
        onClientSaved={handleClientSaved}
        firmId={firmId}
        onSubmit={handleSaveClient}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
};

export default Clients;

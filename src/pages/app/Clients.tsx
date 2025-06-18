
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import AddEditClientModal from '@/components/clients/AddEditClientModal';

type Client = Database['public']['Tables']['clients']['Row'];

const Clients = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const canManageClients = profile?.user_role === 'partner';

  useEffect(() => {
    if (profile?.user_group === 'accounting_firm' && profile?.firm_id) {
      fetchClients();
    }
  }, [profile]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('clients')
        .select('*')
        .eq('firm_id', profile?.firm_id)
        .order('name');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to fetch clients');
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClient = (clientId: string) => {
    navigate(`/app/clients/${clientId}/dashboard`);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!canManageClients) return;

    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
        return;
      }

      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  const handleStatusToggle = async (client: Client) => {
    if (!canManageClients) return;

    const newStatus = client.status === 'active' ? 'inactive' : 'active';

    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', client.id);

      if (error) {
        console.error('Error updating client status:', error);
        toast.error('Failed to update client status');
        return;
      }

      toast.success(`Client ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchClients();
    } catch (error) {
      console.error('Error updating client status:', error);
      toast.error('Failed to update client status');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingClient(null);
    fetchClients();
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  if (profile?.user_group !== 'accounting_firm') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              This module is only available for accounting firm users.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Client Management</h1>
          <p className="text-muted-foreground">Manage your firm's clients and their information</p>
        </div>
        {canManageClients && (
          <Button onClick={handleAddClient}>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Clients</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'No clients found matching your criteria.' : 'No clients found. Add your first client to get started.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{client.gstin || 'N/A'}</TableCell>
                    <TableCell>{client.business_type || 'N/A'}</TableCell>
                    <TableCell>
                      {client.monthly_fee ? `₹${client.monthly_fee.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell>{client.industry || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={client.status === 'active' ? 'default' : 'destructive'}
                        className={canManageClients ? 'cursor-pointer' : ''}
                        onClick={() => canManageClients && handleStatusToggle(client)}
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClient(client.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canManageClients && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClient(client)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClient(client.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddEditClientModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        client={editingClient}
        onClientSaved={handleModalClose}
      />
    </div>
  );
};

export default Clients;

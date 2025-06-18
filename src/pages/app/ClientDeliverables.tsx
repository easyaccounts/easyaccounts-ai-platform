
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CreateDeliverableModal from '@/components/deliverables/CreateDeliverableModal';
import { toast } from 'sonner';

const ClientDeliverables = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('No client ID provided');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  const { data: deliverables = [], isLoading, refetch } = useQuery({
    queryKey: ['client-deliverables', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  const handleDeleteDeliverable = async (deliverableId: string) => {
    if (!confirm('Are you sure you want to delete this deliverable?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('deliverables')
        .delete()
        .eq('id', deliverableId);

      if (error) throw error;

      toast.success('Deliverable deleted successfully');
      refetch();
    } catch (error: any) {
      console.error('Error deleting deliverable:', error);
      toast.error('Failed to delete deliverable');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(`/app/clients/${clientId}/dashboard`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Deliverables</h1>
            <p className="text-muted-foreground">
              Manage deliverables for {client?.name}
            </p>
          </div>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Deliverable
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Deliverables</CardTitle>
          <CardDescription>All deliverables for this client</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading deliverables...</div>
          ) : deliverables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deliverables found. Create the first deliverable to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliverables.map((deliverable) => (
                  <TableRow key={deliverable.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{deliverable.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {deliverable.description?.substring(0, 60)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {deliverable.deliverable_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(deliverable.priority)}>
                        {deliverable.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(deliverable.status)}>
                        {deliverable.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {deliverable.due_date ? new Date(deliverable.due_date).toLocaleDateString() : 'No due date'}
                    </TableCell>
                    <TableCell>
                      {new Date(deliverable.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/deliverable/${deliverable.id}/tasks`)}
                          title="View Tasks"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDeliverable(deliverable.id)}
                          title="Delete Deliverable"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {clientId && (
        <CreateDeliverableModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          clientId={clientId}
          onDeliverableCreated={() => {
            setModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default ClientDeliverables;

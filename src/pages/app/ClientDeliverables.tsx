
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CreateDeliverableModal from '@/components/deliverables/CreateDeliverableModal';

const ClientDeliverables = () => {
  const { clientId } = useParams();
  const [modalOpen, setModalOpen] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Client Deliverables</h1>
          <p className="text-muted-foreground">
            Manage deliverables for this client
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Deliverable
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deliverables</CardTitle>
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
                    <TableCell>{deliverable.deliverable_type}</TableCell>
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
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateDeliverableModal
        isOpen={modalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default ClientDeliverables;

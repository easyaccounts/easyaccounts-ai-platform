
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CreateRequestModal from '@/components/client/CreateRequestModal';

const ClientRequests = () => {
  const { profile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['client-requests', profile?.business_id],
    queryFn: async () => {
      if (!profile?.business_id) return [];
      
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.business_id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      case 'closed': return 'destructive';
      default: return 'outline';
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    refetch();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Requests</h1>
          <p className="text-muted-foreground">
            Create and track requests to your accounting team
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>All requests you've submitted to your accounting team</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No requests found. Create your first request to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.description?.substring(0, 60)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{request.request_type}</TableCell>
                    <TableCell>
                      <Badge variant={request.priority === 'high' ? 'destructive' : 'outline'}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateRequestModal
        isOpen={modalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default ClientRequests;

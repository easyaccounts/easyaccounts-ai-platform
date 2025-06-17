
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useClientContext } from '@/hooks/useClientContext';
import { useSessionContext } from '@/hooks/useSessionContext';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import AddEditRequestModal from '@/components/requests/AddEditRequestModal';
import RequestDetailsModal from '@/components/requests/RequestDetailsModal';

type Request = Database['public']['Tables']['requests']['Row'] & {
  clients?: { name: string };
  assigned_user?: { first_name: string; last_name: string };
  _count?: { messages: number };
};

const Requests = () => {
  const { profile } = useAuth();
  const { selectedClient } = useClientContext();
  const { viewMode } = useSessionContext();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const canCreateRequests = profile?.user_group === 'business_owner';
  const canManageRequests = profile?.user_group === 'accounting_firm';

  useEffect(() => {
    if (profile) {
      fetchRequests();
    }
  }, [profile, selectedClient, viewMode]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // Fix: Fetch requests and related data separately
      let query = supabase
        .from('requests')
        .select('*');

      // Apply filters based on user role and view mode
      if (profile?.user_group === 'accounting_firm') {
        query = query.eq('firm_id', profile.firm_id);
        
        // In client view mode, filter by selected client
        if (viewMode === 'client' && selectedClient) {
          query = query.eq('client_id', selectedClient.id);
        }
      } else if (profile?.user_group === 'business_owner') {
        query = query.eq('business_id', profile.business_id);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      query = query.order('created_at', { ascending: false });

      const { data: requestsData, error } = await query;

      if (error) {
        console.error('Error fetching requests:', error);
        toast.error('Failed to fetch requests');
        return;
      }

      // Fetch client names separately
      const clientIds = [...new Set(requestsData?.map(r => r.client_id).filter(Boolean) || [])];
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name')
        .in('id', clientIds);

      // Fetch assigned user names separately
      const assignedIds = [...new Set(requestsData?.map(r => r.assigned_to).filter(Boolean) || [])];
      const { data: assignedUsers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', assignedIds);

      // Combine data
      const enrichedRequests = requestsData?.map(request => ({
        ...request,
        clients: clients?.find(c => c.id === request.client_id),
        assigned_user: assignedUsers?.find(u => u.id === request.assigned_to)
      })) || [];

      setRequests(enrichedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequest = () => {
    setAddModalOpen(true);
  };

  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const handleAddModalClose = () => {
    setAddModalOpen(false);
    fetchRequests();
  };

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setSelectedRequest(null);
    fetchRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'acknowledged': return 'secondary';
      case 'in_progress': return 'default';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'outline';
      case 'normal': return 'secondary';
      case 'urgent': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Service Requests</h1>
          <p className="text-muted-foreground">
            {canCreateRequests 
              ? 'Submit and track your service requests'
              : viewMode === 'client' && selectedClient 
                ? `Requests from ${selectedClient.name}`
                : 'Manage client service requests'
            }
          </p>
        </div>
        {canCreateRequests && (
          <Button onClick={handleAddRequest}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Requests</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No requests found. {canCreateRequests && 'Submit your first request to get started.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  {!canCreateRequests && viewMode !== 'client' && <TableHead>Client</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  {canManageRequests && <TableHead>Assigned To</TableHead>}
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
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {request.description}
                        </div>
                      </div>
                    </TableCell>
                    {!canCreateRequests && viewMode !== 'client' && (
                      <TableCell>{request.clients?.name}</TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline">
                        {request.request_type?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    {canManageRequests && (
                      <TableCell>
                        {request.assigned_user 
                          ? `${request.assigned_user.first_name} ${request.assigned_user.last_name}`
                          : 'Unassigned'
                        }
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {formatDate(request.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewRequest(request)}
                      >
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

      <AddEditRequestModal
        isOpen={addModalOpen}
        onClose={handleAddModalClose}
        onRequestSaved={handleAddModalClose}
      />

      <RequestDetailsModal
        isOpen={detailsModalOpen}
        onClose={handleDetailsModalClose}
        request={selectedRequest}
      />
    </div>
  );
};

export default Requests;

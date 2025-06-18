import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useClientContext } from '@/hooks/useClientContext';
import { useSessionContext } from '@/hooks/useSessionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Plus, FileUp, MessageSquare, CheckSquare, Eye, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import AddEditDeliverableModal from '@/components/deliverables/AddEditDeliverableModal';
import FinalisationBar from '@/components/finalisation/FinalisationBar';
import AuditLogViewer from '@/components/audit/AuditLogViewer';
import { useNavigate } from 'react-router-dom';
import MessageButton from '@/components/messages/MessageButton';

type Deliverable = Database['public']['Tables']['deliverables']['Row'] & {
  clients?: { name: string };
  assigned_user?: { first_name: string; last_name: string };
  finalised_user?: { first_name: string; last_name: string };
  shared_user?: { first_name: string; last_name: string };
};

const Deliverables = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { selectedClient } = useClientContext();
  const { viewMode } = useSessionContext();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);

  const canManageDeliverables = ['partner', 'senior_staff'].includes(profile?.user_role || '');
  const canUploadData = ['partner', 'senior_staff', 'staff'].includes(profile?.user_role || '');

  useEffect(() => {
    if (profile) {
      fetchDeliverables();
    }
  }, [profile, selectedClient, viewMode]);

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      
      // Fix: Fetch deliverables and related data separately
      let query = supabase
        .from('deliverables')
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

      query = query.order('due_date', { ascending: true });

      const { data: deliverablesData, error } = await query;

      if (error) {
        console.error('Error fetching deliverables:', error);
        toast.error('Failed to fetch deliverables');
        return;
      }

      // Fetch client names separately
      const clientIds = [...new Set(deliverablesData?.map(d => d.client_id).filter(Boolean) || [])];
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name')
        .in('id', clientIds);

      // Fetch assigned user names separately
      const assignedIds = [...new Set(deliverablesData?.map(d => d.assigned_to).filter(Boolean) || [])];
      const { data: assignedUsers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', assignedIds);

      // Fetch finalised user names separately
      const finalisedIds = [...new Set(deliverablesData?.map(d => d.finalised_by).filter(Boolean) || [])];
      const { data: finalisedUsers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', finalisedIds);

      // Fetch shared user names separately
      const sharedIds = [...new Set(deliverablesData?.map(d => d.shared_by).filter(Boolean) || [])];
      const { data: sharedUsers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', sharedIds);

      // Combine data
      const enrichedDeliverables = deliverablesData?.map(deliverable => ({
        ...deliverable,
        clients: clients?.find(c => c.id === deliverable.client_id),
        assigned_user: assignedUsers?.find(u => u.id === deliverable.assigned_to),
        finalised_user: finalisedUsers?.find(u => u.id === deliverable.finalised_by),
        shared_user: sharedUsers?.find(u => u.id === deliverable.shared_by)
      })) || [];

      setDeliverables(enrichedDeliverables);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
      toast.error('Failed to fetch deliverables');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeliverable = () => {
    setEditingDeliverable(null);
    setModalOpen(true);
  };

  const handleEditDeliverable = (deliverable: Deliverable) => {
    setEditingDeliverable(deliverable);
    setModalOpen(true);
  };

  const handleViewTasks = (deliverableId: string) => {
    navigate(`/app/deliverables/${deliverableId}/tasks`);
  };

  const handleStatusUpdate = async (deliverableId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('deliverables')
        .update({ status: newStatus })
        .eq('id', deliverableId);

      if (error) {
        console.error('Error updating deliverable status:', error);
        toast.error('Failed to update status');
        return;
      }

      toast.success('Status updated successfully');
      fetchDeliverables();
    } catch (error) {
      console.error('Error updating deliverable status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleViewDeliverable = (deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
  };

  const handleBackToList = () => {
    setSelectedDeliverable(null);
    fetchDeliverables(); // Refresh data
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingDeliverable(null);
    fetchDeliverables();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'data_received': return 'secondary';
      case 'in_progress': return 'default';
      case 'under_review': return 'outline';
      case 'final': return 'default';
      case 'shared_with_client': return 'default';
      case 'approved': return 'default';
      case 'delivered': return 'default';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (selectedDeliverable) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="mb-4"
            >
              ← Back to Deliverables
            </Button>
            <h1 className="text-3xl font-bold">{selectedDeliverable.title}</h1>
            <p className="text-muted-foreground">
              Deliverable Details and Management
            </p>
          </div>
        </div>

        <FinalisationBar
          entityType="deliverable"
          entity={selectedDeliverable}
          onUpdate={handleBackToList}
        />

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="audit">
              <Activity className="w-4 h-4 mr-2" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deliverable Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="text-sm">{selectedDeliverable.deliverable_type?.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={getStatusColor(selectedDeliverable.status)}>
                      {selectedDeliverable.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                    <p className="text-sm">{formatDate(selectedDeliverable.due_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <p className="text-sm">{selectedDeliverable.priority}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Frequency</label>
                    <p className="text-sm">{selectedDeliverable.frequency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                    <p className="text-sm">
                      {selectedDeliverable.assigned_user 
                        ? `${selectedDeliverable.assigned_user.first_name} ${selectedDeliverable.assigned_user.last_name}`
                        : 'Unassigned'
                      }
                    </p>
                  </div>
                </div>
                
                {selectedDeliverable.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm mt-1">{selectedDeliverable.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handleViewTasks(selectedDeliverable.id)}>
                  View All Tasks
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <AuditLogViewer entityType="deliverable" entityId={selectedDeliverable.id} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Deliverables</h1>
          <p className="text-muted-foreground">
            {viewMode === 'client' && selectedClient 
              ? `Deliverables for ${selectedClient.name}`
              : 'Manage client deliverables and their status'
            }
          </p>
        </div>
        {canManageDeliverables && (
          <Button onClick={handleAddDeliverable}>
            <Plus className="w-4 h-4 mr-2" />
            Add Deliverable
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Deliverables</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="data_received">Data Received</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="shared_with_client">Shared with Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading deliverables...</div>
          ) : deliverables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deliverables found. {canManageDeliverables && 'Add your first deliverable to get started.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  {viewMode !== 'client' && <TableHead>Client</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
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
                          {deliverable.frequency} • Priority: {deliverable.priority}
                        </div>
                      </div>
                    </TableCell>
                    {viewMode !== 'client' && (
                      <TableCell>{deliverable.clients?.name}</TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline">
                        {deliverable.deliverable_type?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(deliverable.due_date)}</TableCell>
                    <TableCell>
                      {deliverable.assigned_user 
                        ? `${deliverable.assigned_user.first_name} ${deliverable.assigned_user.last_name}`
                        : 'Unassigned'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(deliverable.status)}>
                        {deliverable.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDeliverable(deliverable)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTasks(deliverable.id)}
                        >
                          <CheckSquare className="w-4 h-4" />
                        </Button>
                        <MessageButton deliverableId={deliverable.id} />
                        {canManageDeliverables && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDeliverable(deliverable)}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        )}
                        {canUploadData && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: Implement file upload */}}
                          >
                            <FileUp className="w-4 h-4" />
                          </Button>
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

      <AddEditDeliverableModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        deliverable={editingDeliverable}
        onDeliverableSaved={handleModalClose}
      />
    </div>
  );
};

export default Deliverables;

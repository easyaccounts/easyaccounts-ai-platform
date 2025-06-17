
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowLeft, MessageSquare, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import AddEditTaskModal from '@/components/tasks/AddEditTaskModal';
import TaskCommentsModal from '@/components/tasks/TaskCommentsModal';

type DeliverableTask = Database['public']['Tables']['deliverable_tasks']['Row'] & {
  task_assignments?: Array<{
    assigned_to: string;
    profiles: { first_name: string; last_name: string };
  }>;
};

type Deliverable = Database['public']['Tables']['deliverables']['Row'] & {
  clients?: { name: string };
};

const DeliverableTasks = () => {
  const { deliverableId } = useParams<{ deliverableId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [tasks, setTasks] = useState<DeliverableTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DeliverableTask | null>(null);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const canManageTasks = ['partner', 'senior_staff'].includes(profile?.user_role || '');

  useEffect(() => {
    if (deliverableId && profile) {
      fetchDeliverable();
      fetchTasks();
    }
  }, [deliverableId, profile]);

  const fetchDeliverable = async () => {
    try {
      const { data, error } = await supabase
        .from('deliverables')
        .select(`
          *,
          clients(name)
        `)
        .eq('id', deliverableId)
        .single();

      if (error) {
        console.error('Error fetching deliverable:', error);
        toast.error('Failed to load deliverable');
        return;
      }

      setDeliverable(data);
    } catch (error) {
      console.error('Error fetching deliverable:', error);
      toast.error('Failed to load deliverable');
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('deliverable_tasks')
        .select(`
          *,
          task_assignments(
            assigned_to,
            profiles(first_name, last_name)
          )
        `)
        .eq('deliverable_id', deliverableId);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
        return;
      }

      let filteredTasks = data || [];

      // Apply assignee filter
      if (assigneeFilter === 'my_tasks') {
        filteredTasks = filteredTasks.filter(task => 
          task.task_assignments?.some(assignment => assignment.assigned_to === profile?.id)
        );
      } else if (assigneeFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task =>
          task.task_assignments?.some(assignment => assignment.assigned_to === assigneeFilter)
        );
      }

      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEditTask = (task: DeliverableTask) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('deliverable_tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task status:', error);
        toast.error('Failed to update status');
        return;
      }

      toast.success('Status updated successfully');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingTask(null);
    fetchTasks();
  };

  const handleCommentsModalClose = () => {
    setCommentsModalOpen(false);
    setSelectedTaskId(null);
  };

  const openComments = (taskId: string) => {
    setSelectedTaskId(taskId);
    setCommentsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (!deliverable) {
    return <div className="p-6">Loading deliverable...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/app/deliverables')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deliverables
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{deliverable.title} - Tasks</h1>
            <p className="text-muted-foreground">
              {deliverable.clients?.name} • {deliverable.deliverable_type?.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>
        {canManageTasks && (
          <Button onClick={handleAddTask}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tasks</CardTitle>
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="my_tasks">My Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found. {canManageTasks && 'Add your first task to get started.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.task_assignments?.length ? (
                        <div className="space-y-1">
                          {task.task_assignments.map((assignment, index) => (
                            <div key={index} className="text-sm">
                              {assignment.profiles.first_name} {assignment.profiles.last_name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(task.due_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {canManageTasks && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task)}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openComments(task.id)}
                        >
                          <MessageSquare className="w-4 h-4" />
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

      {modalOpen && (
        <AddEditTaskModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          task={editingTask}
          deliverableId={deliverableId!}
          onTaskSaved={handleModalClose}
        />
      )}

      {commentsModalOpen && selectedTaskId && (
        <TaskCommentsModal
          isOpen={commentsModalOpen}
          onClose={handleCommentsModalClose}
          taskId={selectedTaskId}
        />
      )}
    </div>
  );
};

export default DeliverableTasks;

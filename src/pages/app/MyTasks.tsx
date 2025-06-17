
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MessageSquare, ExternalLink } from 'lucide-react';
import { useDeliverableTasks } from '@/hooks/useDeliverableTasks';
import TaskCommentsModal from '@/components/tasks/TaskCommentsModal';

const MyTasks = () => {
  const navigate = useNavigate();
  const { myTasks, loading, getTasksByStatus, getOverdueTasks } = useDeliverableTasks();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const getFilteredTasks = () => {
    switch (statusFilter) {
      case 'pending':
        return getTasksByStatus('pending');
      case 'in_progress':
        return getTasksByStatus('in_progress');
      case 'completed':
        return getTasksByStatus('completed');
      case 'overdue':
        return getOverdueTasks();
      default:
        return myTasks;
    }
  };

  const openComments = (taskId: string) => {
    setSelectedTaskId(taskId);
    setCommentsModalOpen(true);
  };

  const handleCommentsModalClose = () => {
    setCommentsModalOpen(false);
    setSelectedTaskId(null);
  };

  const navigateToDeliverableTasks = (deliverableId: string) => {
    navigate(`/app/deliverables/${deliverableId}/tasks`);
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
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">
            Tasks assigned to you across all deliverables
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Tasks</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found for the selected filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Deliverable</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
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
                      {task.deliverable?.clients?.name}
                    </TableCell>
                    <TableCell>
                      {task.deliverable?.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      {isOverdue(task.due_date, task.status) && (
                        <Badge variant="destructive" className="ml-1">
                          Overdue
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className={isOverdue(task.due_date, task.status) ? 'text-red-600' : ''}>
                          {formatDate(task.due_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openComments(task.id)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateToDeliverableTasks(task.deliverable_id)}
                        >
                          <ExternalLink className="w-4 h-4" />
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

export default MyTasks;

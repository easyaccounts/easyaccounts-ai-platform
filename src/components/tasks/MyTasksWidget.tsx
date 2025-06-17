
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, Calendar, ArrowRight } from 'lucide-react';
import { useDeliverableTasks } from '@/hooks/useDeliverableTasks';

const MyTasksWidget = () => {
  const navigate = useNavigate();
  const { myTasks, loading, getTasksByStatus, getOverdueTasks } = useDeliverableTasks();

  const pendingTasks = getTasksByStatus('pending');
  const inProgressTasks = getTasksByStatus('in_progress');
  const overdueTasks = getOverdueTasks();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>My Tasks</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/my-tasks')}
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Task Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-red-600">
                <Clock className="w-4 h-4" />
                <span className="font-bold">{pendingTasks.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-600">
                <CheckSquare className="w-4 h-4" />
                <span className="font-bold">{inProgressTasks.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-red-600">
                <Calendar className="w-4 h-4" />
                <span className="font-bold">{overdueTasks.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Tasks</h4>
            {myTasks.slice(0, 3).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks assigned to you yet.
              </p>
            ) : (
              <div className="space-y-2">
                {myTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.deliverable?.clients?.name} • {task.deliverable?.title}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(task.status)} className="text-xs">
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(task.due_date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyTasksWidget;

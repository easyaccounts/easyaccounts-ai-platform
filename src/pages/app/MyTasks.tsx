
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';

const MyTasks = () => {
  // Mock data for now - in real implementation, this would come from useQuery
  const tasks = [
    {
      id: '1',
      title: 'Review ABC Corp Tax Returns',
      client: 'ABC Corporation',
      dueDate: '2024-01-15',
      priority: 'high',
      status: 'in_progress'
    },
    {
      id: '2',
      title: 'Prepare Monthly Financial Statements',
      client: 'XYZ Ltd',
      dueDate: '2024-01-20',
      priority: 'medium',
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CheckSquare className="w-6 h-6" />
        <h1 className="text-2xl font-bold">My Tasks</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">2</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">5</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
          <CardDescription>
            Tasks assigned to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{task.title}</h3>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Client: {task.client}
                </p>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyTasks;

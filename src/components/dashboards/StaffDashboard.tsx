
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckSquare, Upload, Users, MessageSquare } from 'lucide-react';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayTasks: 0,
    uploadHistory: 0,
    assignedClients: 0,
    pendingFeedback: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch tasks assigned to user
      const { data: taskAssignments } = await supabase
        .from('task_assignments')
        .select('task:deliverable_tasks(id, title, status, due_date)')
        .eq('assigned_to', user.id);

      const todayTasks = taskAssignments?.filter(ta => {
        const dueDate = new Date(ta.task.due_date);
        const today = new Date();
        return dueDate.toDateString() === today.toDateString();
      }).length || 0;

      // Fetch assigned clients
      const { data: assignments } = await supabase
        .from('team_client_assignments')
        .select('client:clients(id, name)')
        .eq('team_member_id', user.id);

      const assignedClients = assignments?.length || 0;

      // Fetch upload history (transactions created by user)
      const { data: uploads } = await supabase
        .from('transactions')
        .select('id')
        .eq('created_by', user.id);

      const uploadHistory = uploads?.length || 0;

      setStats({
        todayTasks,
        uploadHistory,
        assignedClients,
        pendingFeedback: 0 // Placeholder
      });

      // Set recent tasks
      const recentTasksData = taskAssignments?.slice(0, 5).map(ta => ({
        id: ta.task.id,
        title: ta.task.title,
        status: ta.task.status,
        dueDate: ta.task.due_date
      })) || [];

      setRecentTasks(recentTasksData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const quickActions = [
    { title: 'Upload Docs', description: 'Upload documents', icon: Upload, action: () => navigate('/app/transactions'), color: 'bg-blue-500' },
    { title: 'View Tasks', description: 'Check your tasks', icon: CheckSquare, action: () => navigate('/app/tasks'), color: 'bg-green-500' },
    { title: 'My Clients', description: 'View assigned clients', icon: Users, action: () => navigate('/app/clients'), color: 'bg-purple-500' },
    { title: 'Feedback', description: 'View feedback', icon: MessageSquare, action: () => navigate('/app/requests'), color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload History</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uploadHistory}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingFeedback}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-24 flex flex-col items-center justify-center space-y-2 ${action.color} text-white border-0 hover:opacity-90`}
                onClick={action.action}
              >
                <action.icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold text-sm">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Your latest assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTasks.length > 0 ? (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent tasks</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;

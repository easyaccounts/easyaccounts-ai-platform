
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, Upload, CheckSquare, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SeniorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    assignedClients: 0,
    reviewQueue: 0,
    completedDeliverables: 0,
    pendingTasks: 0
  });
  const [clientProgress, setClientProgress] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch assigned clients
      const { data: assignments } = await supabase
        .from('team_client_assignments')
        .select('client:clients(id, name)')
        .eq('team_member_id', user.id);

      const assignedClients = assignments?.length || 0;

      // Fetch deliverables for assigned clients
      const clientIds = assignments?.map(a => a.client.id) || [];
      const { data: deliverables } = await supabase
        .from('deliverables')
        .select('id, status, title, client_id, clients(name)')
        .in('client_id', clientIds);

      const reviewQueue = deliverables?.filter(d => d.status === 'in_review').length || 0;
      const completedDeliverables = deliverables?.filter(d => d.status === 'completed').length || 0;

      // Fetch tasks
      const { data: tasks } = await supabase
        .from('deliverable_tasks')
        .select('id, status')
        .eq('status', 'pending');

      const pendingTasks = tasks?.length || 0;

      setStats({
        assignedClients,
        reviewQueue,
        completedDeliverables,
        pendingTasks
      });

      // Process client progress data
      const clientProgressData = assignments?.map(assignment => {
        const clientDeliverables = deliverables?.filter(d => d.client_id === assignment.client.id) || [];
        const completed = clientDeliverables.filter(d => d.status === 'completed').length;
        const total = clientDeliverables.length;
        
        return {
          name: assignment.client.name,
          completed,
          total,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      }) || [];

      setClientProgress(clientProgressData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const quickActions = [
    { title: 'Review Docs', description: 'Review pending documents', icon: Eye, action: () => navigate('/app/transactions'), color: 'bg-blue-500' },
    { title: 'My Tasks', description: 'View assigned tasks', icon: CheckSquare, action: () => navigate('/app/tasks'), color: 'bg-green-500' },
    { title: 'Assigned Clients', description: 'View your clients', icon: Users, action: () => navigate('/app/clients'), color: 'bg-purple-500' },
    { title: 'Upload Docs', description: 'Upload documents', icon: Upload, action: () => navigate('/app/transactions'), color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Review Queue</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewQueue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedDeliverables}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for senior staff</CardDescription>
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

      {/* Client Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Client Progress</CardTitle>
          <CardDescription>Deliverable completion rate by client</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeniorDashboard;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Upload, MessageSquare, Calendar, BarChart3 } from 'lucide-react';
import { useUserContext } from '@/hooks/useUserContext';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { selectedClient } = useUserContext();
  const [stats, setStats] = useState({
    activeDeliverables: 0,
    pendingRequests: 0,
    uploadedDocs: 0,
    overdueItems: 0
  });
  const [recentDeliverables, setRecentDeliverables] = useState([]);

  useEffect(() => {
    if (selectedClient) {
      fetchDashboardData();
    }
  }, [selectedClient]);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedClient) return;

      // Fetch deliverables for the selected client
      const { data: deliverables } = await supabase
        .from('deliverables')
        .select('id, title, status, due_date, created_at')
        .eq('client_id', selectedClient.id);

      const activeDeliverables = deliverables?.filter(d => d.status !== 'completed').length || 0;
      const overdueItems = deliverables?.filter(d => {
        if (!d.due_date) return false;
        return new Date(d.due_date) < new Date() && d.status !== 'completed';
      }).length || 0;

      // Fetch requests
      const { data: requests } = await supabase
        .from('requests')
        .select('id, status')
        .eq('client_id', selectedClient.id);

      const pendingRequests = requests?.filter(r => r.status === 'open').length || 0;

      // Fetch uploaded documents
      const { data: transactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('client_id', selectedClient.id);

      const uploadedDocs = transactions?.length || 0;

      setStats({
        activeDeliverables,
        pendingRequests,
        uploadedDocs,
        overdueItems
      });

      // Set recent deliverables
      const recentDeliverablesData = deliverables?.slice(0, 5).map(d => ({
        id: d.id,
        title: d.title,
        status: d.status,
        dueDate: d.due_date,
        createdAt: d.created_at
      })) || [];

      setRecentDeliverables(recentDeliverablesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const quickActions = [
    { title: 'Upload Documents', description: 'Upload new documents', icon: Upload, action: () => navigate('/client/documents'), color: 'bg-blue-500' },
    { title: 'Ask Question', description: 'Submit a request', icon: MessageSquare, action: () => navigate('/client/requests'), color: 'bg-green-500' },
    { title: 'View Reports', description: 'Access your reports', icon: BarChart3, action: () => navigate('/client/reports'), color: 'bg-purple-500' },
    { title: 'Deliverables', description: 'Check deliverables', icon: FileText, action: () => navigate('/client/deliverables'), color: 'bg-orange-500' }
  ];

  if (!selectedClient) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please select a client to view the dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliverables</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDeliverables}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploaded Docs</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uploadedDocs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for clients</CardDescription>
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

      {/* Recent Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliverables</CardTitle>
          <CardDescription>Your latest deliverables and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {recentDeliverables.length > 0 ? (
            <div className="space-y-2">
              {recentDeliverables.map((deliverable) => (
                <div key={deliverable.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{deliverable.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {deliverable.dueDate ? `Due: ${new Date(deliverable.dueDate).toLocaleDateString()}` : 'No due date'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    deliverable.status === 'completed' ? 'bg-green-100 text-green-800' :
                    deliverable.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {deliverable.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent deliverables</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;

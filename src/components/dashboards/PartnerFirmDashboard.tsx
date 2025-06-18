
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, Upload, UserCheck, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const PartnerFirmDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    newClientsThisMonth: 0,
    totalDeliverables: 0,
    pendingDeliverables: 0,
    teamMembers: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [deliverableStatusData, setDeliverableStatusData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch clients stats with proper name field
      const { data: clients } = await supabase
        .from('clients')
        .select('id, created_at, monthly_fee, name');

      const totalClients = clients?.length || 0;
      const newClientsThisMonth = clients?.filter(client => 
        new Date(client.created_at).getMonth() === new Date().getMonth()
      ).length || 0;

      // Fetch deliverables stats
      const { data: deliverables } = await supabase
        .from('deliverables')
        .select('id, status');

      const totalDeliverables = deliverables?.length || 0;
      const pendingDeliverables = deliverables?.filter(d => d.status === 'pending').length || 0;

      // Fetch team members
      const { data: team } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_group', 'accounting_firm');

      const teamMembers = team?.length || 0;

      setStats({
        totalClients,
        newClientsThisMonth,
        totalDeliverables,
        pendingDeliverables,
        teamMembers
      });

      // Process revenue data
      const revenueByClient = clients?.map(client => ({
        name: client.name || 'Unnamed Client',
        revenue: client.monthly_fee || 0
      })) || [];

      setRevenueData(revenueByClient.slice(0, 5)); // Top 5 clients

      // Process deliverable status data
      const statusCounts = deliverables?.reduce((acc, deliverable) => {
        acc[deliverable.status] = (acc[deliverable.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count
      }));

      setDeliverableStatusData(statusData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const quickActions = [
    { title: 'Add Client', description: 'Add a new client', icon: Users, action: () => navigate('/app/clients'), color: 'bg-blue-500' },
    { title: 'Manage Deliverables', description: 'View and manage deliverables', icon: FileText, action: () => navigate('/app/deliverables'), color: 'bg-green-500' },
    { title: 'Manage Team', description: 'Team management', icon: UserCheck, action: () => navigate('/app/team'), color: 'bg-purple-500' },
    { title: 'Upload Docs', description: 'Upload documents', icon: Upload, action: () => navigate('/app/transactions'), color: 'bg-orange-500' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newClientsThisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliverables</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeliverables}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDeliverables}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for partners</CardDescription>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Client</CardTitle>
            <CardDescription>Top 5 clients by monthly fee</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deliverables Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliverableStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliverableStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerFirmDashboard;

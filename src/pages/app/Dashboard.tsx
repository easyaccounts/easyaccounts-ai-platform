
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardRenderer from '@/components/dashboard/DashboardRenderer';
import { useFirmDashboard } from '@/hooks/useFirmDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { profile, loading } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = useFirmDashboard();
  const navigate = useNavigate();

  console.log('App Dashboard rendering:', { 
    profile: profile ? { userGroup: profile.user_group, userRole: profile.user_role } : null,
    loading
  });

  // If user is not a partner, use the role-based dashboard renderer
  if (profile && profile.user_role !== 'partner') {
    return (
      <DashboardRenderer 
        profile={profile} 
        loading={loading} 
        error={null}
      />
    );
  }

  // Partner dashboard with live data
  if (profile && profile.user_role === 'partner') {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalClients ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Active clients in firm
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliverables</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalDeliverables ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                All deliverables
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Deliverables</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.pendingDeliverables ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.teamMembers ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Active team members
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Clients by Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Clients by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData?.topClientsByRevenue ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Deliverable Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Deliverable Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData?.deliverableStatusData ?? []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(dashboardData?.deliverableStatusData ?? []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(dashboardData?.recentActivity ?? []).map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center">
                    <span className="text-sm">{activity.description}</span>
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  </div>
                ))}
                {(!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0) && (
                  <div className="text-sm text-muted-foreground">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => navigate('/app/clients')} 
                className="w-full"
              >
                Add New Client
              </Button>
              <Button 
                onClick={() => navigate('/app/deliverables')} 
                variant="outline" 
                className="w-full"
              >
                Create Deliverable
              </Button>
              <Button 
                onClick={() => navigate('/app/team')} 
                variant="outline" 
                className="w-full"
              >
                Manage Team
              </Button>
              <Button 
                onClick={() => navigate('/app/assign-clients')} 
                variant="outline" 
                className="w-full"
              >
                Assign Clients
              </Button>
              <Button 
                onClick={() => navigate('/app/reports')} 
                variant="outline" 
                className="w-full"
              >
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fallback to the original dashboard renderer for other cases
  return (
    <DashboardRenderer 
      profile={profile} 
      loading={loading} 
      error={null}
    />
  );
};

export default Dashboard;

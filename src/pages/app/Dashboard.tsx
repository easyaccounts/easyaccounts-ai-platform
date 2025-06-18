
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Users, Building2, FileText, CheckCircle, Clock, Plus, UserPlus, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Sample data for charts
const clientRevenueData = [
  { name: 'ABC Corp', revenue: 12500 },
  { name: 'XYZ Ltd', revenue: 9800 },
  { name: 'Tech Solutions', revenue: 8200 },
  { name: 'Green Energy', revenue: 7100 },
  { name: 'Local Store', revenue: 5900 },
];

const deliverableStatusData = [
  { name: 'Pending', value: 12, color: '#f59e0b' },
  { name: 'In Progress', value: 8, color: '#3b82f6' },
  { name: 'Review', value: 5, color: '#8b5cf6' },
  { name: 'Completed', value: 25, color: '#10b981' },
];

const Dashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const { currentView, loading: contextLoading } = useUserContext();

  console.log('App Dashboard rendering:', { 
    profile: profile ? { userGroup: profile.user_group, userRole: profile.user_role } : null,
    currentView,
    authLoading,
    contextLoading
  });

  // Show loading state while auth or context is loading
  if (authLoading || contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle missing profile
  if (!profile) {
    console.error('Dashboard: No profile available');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Profile Not Found
            </CardTitle>
            <CardDescription>
              Unable to load your profile data. Please try refreshing or contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show firm dashboard for firm view mode
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile.first_name}!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your firm today.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliverables</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50</div>
            <p className="text-xs text-muted-foreground">
              +7 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliverables</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              5 due this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              2 partners, 3 senior, 3 staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Clients by Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Clients by Revenue</CardTitle>
            <CardDescription>Monthly revenue from top performing clients</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deliverable Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Deliverable Status Distribution</CardTitle>
            <CardDescription>Current status of all deliverables</CardDescription>
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Only show if user is partner */}
      {profile.user_role === 'partner' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to help you manage your firm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button className="h-auto flex flex-col items-center p-4 space-y-2">
                <Plus className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Add New Client</div>
                  <div className="text-xs text-muted-foreground">Register a new client</div>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto flex flex-col items-center p-4 space-y-2">
                <UserCheck className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Assign Client</div>
                  <div className="text-xs text-muted-foreground">Assign clients to team members</div>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto flex flex-col items-center p-4 space-y-2">
                <UserPlus className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Add Team Member</div>
                  <div className="text-xs text-muted-foreground">Invite new team member</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across your firm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm">Monthly accounts completed for ABC Corp</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm">VAT return due for XYZ Ltd in 3 days</p>
                <p className="text-xs text-muted-foreground">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FileText className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm">New documents uploaded by Tech Solutions</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

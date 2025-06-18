
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, MessageSquare, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';

// Sample data for client charts (keeping charts as they need more complex data structure)
const deliverableProgressData = [
  { stage: 'Pending', count: 3 },
  { stage: 'In Progress', count: 2 },
  { stage: 'Review', count: 1 },
  { stage: 'Completed', count: 8 },
];

const uploadsOverTimeData = [
  { month: 'Jan', uploads: 12 },
  { month: 'Feb', uploads: 18 },
  { month: 'Mar', uploads: 15 },
  { month: 'Apr', uploads: 22 },
  { month: 'May', uploads: 19 },
  { month: 'Jun', uploads: 25 },
];

const ClientDashboardPage = () => {
  const { profile } = useAuth();
  const { selectedClient } = useUserContext();
  const { data, isLoading } = useDashboardData('client');

  // Check if we're in a client-specific route (for firm members)
  const { clientId } = useParams();
  const isContextAware = !!clientId;

  console.log('Client Dashboard Page rendering:', { 
    profile: profile ? { userGroup: profile.user_group, userRole: profile.user_role } : null,
    selectedClient,
    clientId,
    isContextAware
  });

  const getBaseRoute = () => {
    if (isContextAware) {
      return `/app/clients/${clientId}`;
    }
    return '/client';
  };

  const getPageTitle = () => {
    if (isContextAware) {
      return 'Client Dashboard';
    }
    return 'My Business Dashboard';
  };

  const getWelcomeMessage = () => {
    if (isContextAware) {
      return 'Manage this client\'s accounting and business needs.';
    }
    return `Welcome back, ${profile?.first_name}! Manage your business accounting here.`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground">
            {getWelcomeMessage()}
          </p>
          {selectedClient && !isContextAware && (
            <p className="text-sm text-blue-600 mt-1">
              Viewing: {selectedClient.name}
            </p>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deliverables Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.deliverablesPending ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploads Completed</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.uploadsCompleted ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks in Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.tasksInProgress ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {isContextAware ? 'Accounting team working' : 'Accounting team working'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.openRequests ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Deliverable Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Deliverable Progress by Stage</CardTitle>
            <CardDescription>Current status of deliverables</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliverableProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Uploads Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Document Uploads Over Time</CardTitle>
            <CardDescription>Monthly document upload activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={uploadsOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="uploads" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            {isContextAware ? 'Manage this client\'s account' : 'Common tasks to help manage your business'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button asChild className="h-auto flex flex-col items-center p-4 space-y-2">
              <Link to={`${getBaseRoute()}/requests`}>
                <MessageSquare className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">
                    {isContextAware ? 'View Requests' : 'Request Document'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isContextAware ? 'Client requests' : 'Ask for specific information'}
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto flex flex-col items-center p-4 space-y-2">
              <Link to={`${getBaseRoute()}/documents`}>
                <Upload className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">
                    {isContextAware ? 'View Documents' : 'Upload Files'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isContextAware ? 'Client documents' : 'Upload receipts and documents'}
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Reports</CardTitle>
          <CardDescription>
            {isContextAware ? 'Recent financial reports for this client' : 'Your most recent financial reports'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Monthly Management Accounts - May 2024</p>
                  <p className="text-sm text-muted-foreground">Generated on June 5, 2024</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Download</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">VAT Return Q1 2024</p>
                  <p className="text-sm text-muted-foreground">Submitted on April 30, 2024</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Download</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Annual Accounts 2023</p>
                  <p className="text-sm text-muted-foreground">Completed on March 15, 2024</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Download</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates on this account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm">Management accounts for May have been completed</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Upload className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm">
                  {isContextAware ? 'Client uploaded 5 new receipts' : 'You uploaded 5 new receipts'}
                </p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm">
                  {isContextAware ? 'New message from client' : 'New message from your accounting team'}
                </p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboardPage;

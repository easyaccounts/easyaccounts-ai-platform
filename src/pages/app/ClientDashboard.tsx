
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  CreditCard, 
  Download, 
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowLeft,
  Plus
} from 'lucide-react';

interface DashboardStats {
  deliverablesPending: number;
  uploadsCompleted: number;
  tasksInProgress: number;
  openRequests: number;
}

const ClientDashboard = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Fetch client details
  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('No client ID provided');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  // Fetch dashboard stats
  const { data: dashboardData } = useQuery({
    queryKey: ['client-dashboard-stats', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      
      const { data, error } = await supabase
        .rpc('get_client_dashboard_stats', { p_client_id: clientId });
      
      if (error) throw error;
      return data as unknown as DashboardStats;
    },
    enabled: !!clientId,
  });

  if (clientLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading client dashboard...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Client not found.</p>
            <div className="text-center mt-4">
              <Button onClick={() => navigate('/app/clients')}>
                Back to Clients
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/app/clients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">
              {client.business_type} • {client.industry}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate(`/app/clients/${clientId}/deliverables`)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Deliverable
          </Button>
        </div>
      </div>

      {/* Client Overview Banner */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-blue-700">{client.name}</CardTitle>
              <CardDescription className="mt-1">
                {client.industry} • {client.status} • ₹{client.monthly_fee?.toLocaleString() || 0}/month
              </CardDescription>
            </div>
            <Badge variant={client.status === 'active' ? 'default' : 'destructive'}>
              {client.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium">{client.email || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <p className="font-medium">{client.phone || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-gray-600">GSTIN:</span>
              <p className="font-medium">{client.gstin || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-gray-600">City:</span>
              <p className="font-medium">{client.city || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliverables</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.deliverablesPending || 0}</div>
            <p className="text-xs text-muted-foreground">Pending completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Document Uploads</CardTitle>
            <Upload className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.uploadsCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks in Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.tasksInProgress || 0}</div>
            <p className="text-xs text-muted-foreground">Team working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.openRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage this client's account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center p-4 space-y-2"
              onClick={() => navigate(`/app/clients/${clientId}/deliverables`)}
            >
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Deliverables</div>
                <div className="text-xs text-muted-foreground">Manage tasks</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center p-4 space-y-2"
              onClick={() => navigate(`/app/clients/${clientId}/documents`)}
            >
              <Upload className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Documents</div>
                <div className="text-xs text-muted-foreground">View uploads</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center p-4 space-y-2"
              onClick={() => navigate(`/app/clients/${clientId}/requests`)}
            >
              <MessageSquare className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Requests</div>
                <div className="text-xs text-muted-foreground">Client requests</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex flex-col items-center p-4 space-y-2"
              onClick={() => navigate(`/app/clients/${clientId}/transactions`)}
            >
              <CreditCard className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Transactions</div>
                <div className="text-xs text-muted-foreground">Financial data</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates for this client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm">Monthly management accounts completed</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Upload className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm">New documents uploaded by client</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm">Client submitted new service request</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;

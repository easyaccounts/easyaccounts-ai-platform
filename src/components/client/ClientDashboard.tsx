
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  TrendingUp
} from 'lucide-react';
import { useClientContext } from '@/hooks/useClientContext';

const ClientDashboard = () => {
  const { selectedClient } = useClientContext();

  if (!selectedClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Select a Client</CardTitle>
            <CardDescription className="text-center">
              Choose a client from the dropdown above to view their dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Mock data - in a real app, this would come from the database
  const clientData = {
    overview: {
      status: 'Active',
      monthlyFee: '$2,500',
      industry: 'Technology',
      clientManager: 'Sarah Johnson',
    },
    deliverables: [
      { id: 1, title: 'Monthly GST Return', dueDate: '2024-12-15', status: 'Completed', type: 'Tax Filing' },
      { id: 2, title: 'Financial Statement', dueDate: '2024-12-20', status: 'In Progress', type: 'Financial Report' },
      { id: 3, title: 'Quarterly Review', dueDate: '2024-12-25', status: 'Pending', type: 'Advisory' },
    ],
    reports: [
      { id: 1, title: 'Profit & Loss Statement', date: '2024-11-30', approved: true },
      { id: 2, title: 'Balance Sheet', date: '2024-11-30', approved: true },
      { id: 3, title: 'Cash Flow Statement', date: '2024-11-30', approved: false },
    ],
    activities: [
      { id: 1, action: 'Bank statements uploaded', timestamp: '2 hours ago', user: 'Client' },
      { id: 2, action: 'GST return reviewed and approved', timestamp: '1 day ago', user: 'Sarah Johnson' },
      { id: 3, action: 'Invoice #INV-001 generated', timestamp: '2 days ago', user: 'System' },
    ],
    uploads: [
      { id: 1, document: 'Bank Statement - November', status: 'Received', date: '2024-12-01' },
      { id: 2, document: 'Expense Receipts', status: 'Pending', date: '2024-12-03' },
      { id: 3, document: 'Purchase Invoices', status: 'Processing', date: '2024-12-02' },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'default';
      case 'in progress': return 'secondary';
      case 'pending': return 'outline';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Overview Banner */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-blue-700">{selectedClient.name}</CardTitle>
              <CardDescription className="mt-1">
                {clientData.overview.industry} • {clientData.overview.status} • {clientData.overview.monthlyFee}/month
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {clientData.overview.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Client Manager:</span>
              <p className="font-medium">{clientData.overview.clientManager}</p>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium">{selectedClient.email || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <p className="font-medium">{selectedClient.phone || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-gray-600">City:</span>
              <p className="font-medium">{selectedClient.city || 'Not provided'}</p>
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
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">1 overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Uploads</CardTitle>
            <Upload className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Documents needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Ready</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Available for download</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Deliverables Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Current Deliverables</span>
            </CardTitle>
            <CardDescription>Track progress on assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientData.deliverables.map((deliverable) => (
                <div key={deliverable.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(deliverable.status)}
                    <div>
                      <p className="font-medium">{deliverable.title}</p>
                      <p className="text-sm text-gray-600">
                        {deliverable.type} • Due: {deliverable.dueDate}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(deliverable.status)}>
                    {deliverable.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage client account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Request Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              View Transactions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reports and Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Approved financial reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientData.reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-sm text-gray-600">Generated: {report.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {report.approved ? (
                      <>
                        <Badge variant="default">Approved</Badge>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </>
                    ) : (
                      <Badge variant="secondary">Under Review</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientData.activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">
                      {activity.user} • {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;

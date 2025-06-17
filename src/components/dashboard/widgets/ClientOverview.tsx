
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Upload, MessageSquare, CreditCard, Download, ExternalLink } from 'lucide-react';

const deliverables = [
  { title: 'Monthly GST Return', status: 'Completed', dueDate: '2024-12-15', downloadable: true },
  { title: 'Financial Statement', status: 'In Progress', dueDate: '2024-12-20', downloadable: false },
  { title: 'Tax Filing Report', status: 'Pending', dueDate: '2024-12-25', downloadable: false },
];

const firmRequests = [
  { request: 'Upload December Bank Statements', priority: 'High', requested: '2 days ago' },
  { request: 'Provide Expense Receipts', priority: 'Medium', requested: '1 week ago' },
  { request: 'Review Financial Report Draft', priority: 'Low', requested: '2 weeks ago' },
];

const bankFeeds = [
  { bank: 'HDFC Bank - ****1234', status: 'Connected', lastSync: '2 hours ago' },
  { bank: 'ICICI Bank - ****5678', status: 'Connected', lastSync: '1 day ago' },
  { bank: 'SBI Bank - ****9012', status: 'Disconnected', lastSync: '1 week ago' },
];

const ClientOverview = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Deliverables</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">5</div>
            <p className="text-xs text-gray-600">2 ready for download</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bank Accounts</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3</div>
            <p className="text-xs text-gray-600">2 connected</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-gray-600">1 high priority</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Documents Uploaded</CardTitle>
            <Upload className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">12</div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Deliverables & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-purple-700">Current Deliverables</CardTitle>
            <CardDescription>Track your reports and documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliverables.map((deliverable, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{deliverable.title}</p>
                    <p className="text-sm text-gray-600">Due: {deliverable.dueDate}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={deliverable.status === 'Completed' ? 'default' : deliverable.status === 'In Progress' ? 'secondary' : 'outline'}>
                      {deliverable.status}
                    </Badge>
                    {deliverable.downloadable && (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-700">Quick Actions</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Request Report
            </Button>
            <Button className="w-full justify-start bg-green-600 hover:bg-green-700" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Firm
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Firm Requests & Bank Feeds */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-700">Requests from Firm</CardTitle>
            <CardDescription>Action items from your accounting firm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {firmRequests.map((request, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={request.priority === 'High' ? 'destructive' : request.priority === 'Medium' ? 'default' : 'secondary'}>
                      {request.priority}
                    </Badge>
                    <span className="text-xs text-gray-500">{request.requested}</span>
                  </div>
                  <p className="text-sm font-medium">{request.request}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Bank Feed Status</CardTitle>
            <CardDescription>Connected account synchronization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bankFeeds.map((feed, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{feed.bank}</p>
                    <p className="text-xs text-gray-600">Last sync: {feed.lastSync}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={feed.status === 'Connected' ? 'default' : 'destructive'}>
                      {feed.status}
                    </Badge>
                    {feed.status === 'Disconnected' && (
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
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

export default ClientOverview;

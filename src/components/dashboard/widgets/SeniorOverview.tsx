
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileCheck, Users, AlertTriangle, CheckCircle2, Upload } from 'lucide-react';

const pendingApprovals = [
  { item: 'TechCorp GST Return', staff: 'John Doe', submitted: '2 hours ago', priority: 'High' },
  { item: 'RetailMax Journal Entry', staff: 'Jane Smith', submitted: '4 hours ago', priority: 'Medium' },
  { item: 'FinanceFlow Expense Report', staff: 'Mike Johnson', submitted: '1 day ago', priority: 'Low' },
];

const clientRequests = [
  { client: 'TechCorp Ltd', request: 'Financial Statement Review', urgency: 'High', due: '2 days' },
  { client: 'StartupXYZ', request: 'Tax Planning Consultation', urgency: 'Medium', due: '5 days' },
  { client: 'RetailMax', request: 'Audit Preparation', urgency: 'Low', due: '1 week' },
];

const SeniorOverview = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">12</div>
            <p className="text-xs text-gray-600">3 high priority</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Client Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
            <p className="text-xs text-gray-600">2 urgent</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Reviews</CardTitle>
            <FileCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">45</div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Staff Supervised</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">6</div>
            <p className="text-xs text-gray-600">Active members</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-orange-700">Staff Submissions Awaiting Approval</CardTitle>
            <CardDescription>Review and approve staff work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((approval, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{approval.item}</p>
                    <p className="text-sm text-gray-600">by {approval.staff} • {approval.submitted}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={approval.priority === 'High' ? 'destructive' : approval.priority === 'Medium' ? 'default' : 'secondary'}>
                      {approval.priority}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-orange-700">Quick Actions</CardTitle>
            <CardDescription>Review and manage workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Request Client Docs
            </Button>
            <Button className="w-full justify-start bg-green-600 hover:bg-green-700" size="sm">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve Entry
            </Button>
            <Button className="w-full justify-start bg-red-600 hover:bg-red-700" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Escalate Issue
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Client Requests Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-700">Client Request Queue</CardTitle>
          <CardDescription>Manage incoming client requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clientRequests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium">{request.client}</p>
                  <p className="text-sm text-gray-600">{request.request}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={request.urgency === 'High' ? 'destructive' : request.urgency === 'Medium' ? 'default' : 'secondary'}>
                    {request.urgency}
                  </Badge>
                  <span className="text-sm text-gray-500">Due: {request.due}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeniorOverview;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FileCheck, Clock, TrendingUp, CheckCircle2, Upload, FileText } from 'lucide-react';

const combinedTasks = [
  { task: 'Review Marketing Expense Report', type: 'Review', priority: 'High', due: '2024-12-20', assigned: 'Jane Smith' },
  { task: 'Process IT Department Invoices', type: 'Entry', priority: 'Medium', due: '2024-12-22', assigned: 'You' },
  { task: 'Approve Sales Commission Entry', type: 'Approval', priority: 'High', due: '2024-12-21', assigned: 'Mike Johnson' },
];

const deliverablesPipeline = [
  { deliverable: 'Q4 Financial Statements', status: 'In Progress', department: 'All', completion: '75%' },
  { deliverable: 'Sales Department P&L', status: 'Review', department: 'Sales', completion: '90%' },
  { deliverable: 'IT Budget Reconciliation', status: 'Pending', department: 'IT', completion: '25%' },
];

const workflowMetrics = [
  { metric: 'Tasks Completed', value: '45', change: '+12%', period: 'This week' },
  { metric: 'Average Review Time', value: '2.3h', change: '-8%', period: 'Per task' },
  { metric: 'Approval Rate', value: '94%', change: '+3%', period: 'This month' },
];

const AccountingTeamOverview = () => {
  return (
    <div className="space-y-6">
      {/* Hybrid Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Combined Tasks</CardTitle>
            <Users className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">18</div>
            <p className="text-xs text-gray-600">Review + Entry tasks</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
            <FileCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">7</div>
            <p className="text-xs text-gray-600">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Deliverables</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">12</div>
            <p className="text-xs text-gray-600">Across departments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Team Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">92%</div>
            <p className="text-xs text-gray-600">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Combined Task Queue & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-teal-700">Combined Task Queue</CardTitle>
            <CardDescription>Review tasks and data entry work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {combinedTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{task.task}</p>
                    <p className="text-sm text-gray-600">Assigned to: {task.assigned} • Due: {task.due}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={task.type === 'Review' ? 'default' : task.type === 'Entry' ? 'secondary' : 'outline'}>
                      {task.type}
                    </Badge>
                    <Badge variant={task.priority === 'High' ? 'destructive' : 'default'}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-teal-700">Quick Actions</CardTitle>
            <CardDescription>Streamlined workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-teal-600 hover:bg-teal-700" size="sm">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Review & Approve
            </Button>
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Create Entry
            </Button>
            <Button className="w-full justify-start bg-green-600 hover:bg-green-700" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Deliverables Pipeline & Workflow Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Deliverables Pipeline</CardTitle>
            <CardDescription>Cross-departmental deliverable status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliverablesPipeline.map((deliverable, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{deliverable.deliverable}</p>
                    <Badge variant={deliverable.status === 'In Progress' ? 'default' : deliverable.status === 'Review' ? 'secondary' : 'outline'}>
                      {deliverable.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{deliverable.department}</span>
                    <span className="text-sm font-medium text-blue-600">{deliverable.completion} complete</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-700">Workflow Metrics</CardTitle>
            <CardDescription>Performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowMetrics.map((metric, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium">{metric.metric}</p>
                    <span className={`text-sm font-medium ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                    <span className="text-xs text-gray-500">{metric.period}</span>
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

export default AccountingTeamOverview;

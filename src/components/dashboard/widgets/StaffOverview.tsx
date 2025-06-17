
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Upload, FileText, Clock, Brain, History } from 'lucide-react';

const assignedTasks = [
  { task: 'TechCorp Monthly Books', due: '2024-12-20', priority: 'High', status: 'In Progress' },
  { task: 'RetailMax Expense Entry', due: '2024-12-22', priority: 'Medium', status: 'Pending' },
  { task: 'FinanceFlow GST Filing', due: '2024-12-25', priority: 'Low', status: 'Not Started' },
];

const aiSuggestions = [
  { type: 'Journal Entry', description: 'Office Rent - December 2024', confidence: '95%' },
  { type: 'Expense Classification', description: 'Travel Expense - Business Trip', confidence: '89%' },
  { type: 'GST Code', description: 'Software License - GST @18%', confidence: '92%' },
];

const recentUploads = [
  { document: 'TechCorp_Invoice_Dec2024.pdf', uploaded: '2 hours ago', status: 'Processed' },
  { document: 'RetailMax_Receipt_123.jpg', uploaded: '4 hours ago', status: 'Processing' },
  { document: 'FinanceFlow_Statement.pdf', uploaded: '1 day ago', status: 'Processed' },
];

const StaffOverview = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tasks Assigned</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">15</div>
            <p className="text-xs text-gray-600">3 high priority</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">AI Suggestions</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8</div>
            <p className="text-xs text-gray-600">Pending review</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Documents Uploaded</CardTitle>
            <Upload className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">23</div>
            <p className="text-xs text-gray-600">This week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">32</div>
            <p className="text-xs text-gray-600">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-green-700">Assigned Tasks</CardTitle>
            <CardDescription>Your current workload and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{task.task}</p>
                    <p className="text-sm text-gray-600">Due: {task.due}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}>
                      {task.priority}
                    </Badge>
                    <Badge variant={task.status === 'In Progress' ? 'default' : task.status === 'Pending' ? 'secondary' : 'outline'}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Quick Actions</CardTitle>
            <CardDescription>Streamline your workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-green-600 hover:bg-green-700" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Enter Journal
            </Button>
            <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700" size="sm">
              <CheckSquare className="w-4 h-4 mr-2" />
              Submit Work
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions & Upload History */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">AI Entry Suggestions</CardTitle>
            <CardDescription>Review AI-generated suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{suggestion.type}</Badge>
                    <span className="text-sm text-green-600 font-medium">{suggestion.confidence}</span>
                  </div>
                  <p className="text-sm">{suggestion.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-700">Recent Uploads</CardTitle>
            <CardDescription>Document processing status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUploads.map((upload, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{upload.document}</p>
                    <p className="text-xs text-gray-600">{upload.uploaded}</p>
                  </div>
                  <Badge variant={upload.status === 'Processed' ? 'default' : 'secondary'}>
                    {upload.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffOverview;

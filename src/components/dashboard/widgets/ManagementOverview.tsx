
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, TrendingUp, Users, PieChart, BarChart3, FileText } from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ClientOverview from './ClientOverview';

const departmentData = [
  { name: 'Sales', value: 35, color: '#3b82f6' },
  { name: 'Marketing', value: 25, color: '#10b981' },
  { name: 'Operations', value: 20, color: '#f59e0b' },
  { name: 'IT', value: 20, color: '#ef4444' },
];

const profitabilityData = [
  { department: 'Sales', profit: 150000, expenses: 80000 },
  { department: 'Marketing', profit: 120000, expenses: 95000 },
  { department: 'Operations', profit: 100000, expenses: 70000 },
  { department: 'IT', profit: 90000, expenses: 85000 },
];

const teamActivity = [
  { member: 'John Doe - Sales', activity: 'Completed Q4 Report', time: '2 hours ago', department: 'Sales' },
  { member: 'Jane Smith - Marketing', activity: 'Uploaded Campaign Expenses', time: '4 hours ago', department: 'Marketing' },
  { member: 'Mike Johnson - IT', activity: 'Software License Renewal', time: '1 day ago', department: 'IT' },
];

const ManagementOverview = () => {
  return (
    <div className="space-y-6">
      {/* Enhanced Stats Grid for Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Departments</CardTitle>
            <Building className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">4</div>
            <p className="text-xs text-gray-600">All active</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overall Profitability</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹4.6L</div>
            <p className="text-xs text-gray-600">+15% from last quarter</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Team Members</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">24</div>
            <p className="text-xs text-gray-600">Across all departments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">12</div>
            <p className="text-xs text-gray-600">8 on track</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-indigo-700">Expense Distribution by Department</CardTitle>
            <CardDescription>Current quarter breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <RechartsPieChart data={departmentData}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Profitability by Department</CardTitle>
            <CardDescription>Profit vs expenses comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${(Number(value) / 1000).toFixed(0)}K`, '']} />
                <Bar dataKey="profit" fill="#10b981" name="Profit" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-700">Recent Team Activity</CardTitle>
          <CardDescription>Cross-departmental activity summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium">{activity.member}</p>
                  <p className="text-sm text-gray-600">{activity.activity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{activity.department}</Badge>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Include Client Overview for inherited functionality */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Portal Features</h2>
        <ClientOverview />
      </div>
    </div>
  );
};

export default ManagementOverview;

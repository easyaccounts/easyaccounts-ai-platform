
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Upload, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  const { data, isLoading } = useDashboardData('client');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          Client Portal
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Deliverables</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data?.deliverablesPending ?? 0}</div>
            <p className="text-xs text-gray-600">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Uploads Completed</CardTitle>
            <Upload className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data?.uploadsCompleted ?? 0}</div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tasks in Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data?.tasksInProgress ?? 0}</div>
            <p className="text-xs text-gray-600">Active work items</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Open Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data?.openRequests ?? 0}</div>
            <p className="text-xs text-gray-600">Pending responses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-blue-700">Monthly Activity Overview</CardTitle>
            <CardDescription>Your business activity trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { month: 'Jan', uploads: data?.uploadsCompleted ?? 0, tasks: data?.tasksInProgress ?? 0 },
                { month: 'Feb', uploads: Math.floor((data?.uploadsCompleted ?? 0) * 0.8), tasks: Math.floor((data?.tasksInProgress ?? 0) * 0.9) },
                { month: 'Mar', uploads: Math.floor((data?.uploadsCompleted ?? 0) * 1.2), tasks: Math.floor((data?.tasksInProgress ?? 0) * 1.1) },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="uploads" fill="#10b981" name="Uploads" />
                <Bar dataKey="tasks" fill="#3b82f6" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Quick Actions</CardTitle>
            <CardDescription>Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start bg-blue-600 hover:bg-blue-700" size="sm">
              <Link to="/client/uploads">
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-green-600 hover:bg-green-700" size="sm">
              <Link to="/client/deliverables">
                <FileText className="w-4 h-4 mr-2" />
                View Deliverables
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-purple-600 hover:bg-purple-700" size="sm">
              <Link to="/client/requests">
                <AlertCircle className="w-4 h-4 mr-2" />
                Create Request
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-orange-600 hover:bg-orange-700" size="sm">
              <Link to="/client/reports">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;

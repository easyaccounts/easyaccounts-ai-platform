
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const Dashboard = () => {
  const { profile } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDashboardData = () => {
    if (profile?.user_group === 'accounting_firm') {
      return {
        title: `${getGreeting()}, ${profile.first_name}`,
        subtitle: `${profile.firm_name} Dashboard`,
        stats: [
          {
            title: 'Total Clients',
            value: '127',
            change: '+8%',
            icon: Users,
            trend: 'up'
          },
          {
            title: 'Pending Invoices',
            value: '₹2.4L',
            change: '+12%',
            icon: FileText,
            trend: 'up'
          },
          {
            title: 'Monthly Revenue',
            value: '₹18.5L',
            change: '+5%',
            icon: DollarSign,
            trend: 'up'
          },
          {
            title: 'Active Deliverables',
            value: '34',
            change: '-3%',
            icon: Clock,
            trend: 'down'
          }
        ],
        quickActions: [
          'Add New Client',
          'Create Invoice',
          'Upload Documents',
          'Generate Report'
        ]
      };
    } else {
      return {
        title: `${getGreeting()}, ${profile?.first_name}`,
        subtitle: `${profile?.business_name} Dashboard`,
        stats: [
          {
            title: 'Monthly Expenses',
            value: '₹1.2L',
            change: '+8%',
            icon: TrendingUp,
            trend: 'up'
          },
          {
            title: 'Outstanding Invoices',
            value: '₹3.4L',
            change: '-12%',
            icon: FileText,
            trend: 'down'
          },
          {
            title: 'Bank Balance',
            value: '₹8.5L',
            change: '+5%',
            icon: DollarSign,
            trend: 'up'
          },
          {
            title: 'Pending Tasks',
            value: '12',
            change: '-3%',
            icon: Clock,
            trend: 'down'
          }
        ],
        quickActions: [
          'Record Expense',
          'Upload Receipt',
          'View Reports',
          'Download Statements'
        ]
      };
    }
  };

  const dashboardData = getDashboardData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{dashboardData.title}</h1>
        <p className="text-gray-600">{dashboardData.subtitle}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">{profile?.user_role}</Badge>
          <Badge variant="outline">{profile?.user_group === 'accounting_firm' ? 'CA Firm' : 'Business'}</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-gray-600">
                {stat.trend === 'up' ? (
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Invoice #INV-001 paid</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <Badge variant="secondary">₹25,000</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New expense receipt uploaded</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
                <Badge variant="outline">₹1,200</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">GST return due in 3 days</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
                <Badge variant="destructive">Action Required</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New client onboarded</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
                <Badge variant="secondary">TechCorp Ltd</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {dashboardData.quickActions.map((action, index) => (
                <button
                  key={index}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium">{action}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Monthly financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart will be implemented here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Important dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="text-sm font-medium">GST Return</p>
                  <p className="text-xs text-gray-600">March 2024</p>
                </div>
                <Badge variant="destructive">3 days</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="text-sm font-medium">TDS Return</p>
                  <p className="text-xs text-gray-600">Q4 2024</p>
                </div>
                <Badge variant="secondary">7 days</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-sm font-medium">Audit Report</p>
                  <p className="text-xs text-gray-600">TechCorp Ltd</p>
                </div>
                <Badge variant="outline">15 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, CheckSquare, TrendingUp, Plus, UserPlus, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { client: 'TechCorp', revenue: 45000 },
  { client: 'RetailMax', revenue: 32000 },
  { client: 'FinanceFlow', revenue: 28000 },
  { client: 'StartupXYZ', revenue: 15000 },
];

const topClients = [
  { name: 'TechCorp Ltd', fees: '₹45,000', activity: 'High', status: 'Active' },
  { name: 'RetailMax Pvt', fees: '₹32,000', activity: 'Medium', status: 'Active' },
  { name: 'FinanceFlow', fees: '₹28,000', activity: 'High', status: 'Pending' },
  { name: 'StartupXYZ', fees: '₹15,000', activity: 'Low', status: 'Active' },
];

const PartnerOverview = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">127</div>
            <p className="text-xs text-gray-600">+8 from last month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹1.2L</div>
            <p className="text-xs text-gray-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Deliverables</CardTitle>
            <CheckSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">34</div>
            <p className="text-xs text-gray-600">5 due this week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Team Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">94%</div>
            <p className="text-xs text-gray-600">Efficiency rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-blue-700">Revenue by Client</CardTitle>
            <CardDescription>Top performing clients this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="client" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Quick Actions</CardTitle>
            <CardDescription>Manage your firm efficiently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
            <Button className="w-full justify-start bg-green-600 hover:bg-green-700" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Assign Deliverable
            </Button>
            <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700" size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Firm User
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-700">Top Clients</CardTitle>
          <CardDescription>Clients ranked by fees and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-gray-600">Client Name</th>
                  <th className="text-left p-2 font-medium text-gray-600">Monthly Fees</th>
                  <th className="text-left p-2 font-medium text-gray-600">Activity Level</th>
                  <th className="text-left p-2 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((client, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{client.name}</td>
                    <td className="p-2 text-green-600 font-semibold">{client.fees}</td>
                    <td className="p-2">
                      <Badge variant={client.activity === 'High' ? 'default' : client.activity === 'Medium' ? 'secondary' : 'outline'}>
                        {client.activity}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerOverview;

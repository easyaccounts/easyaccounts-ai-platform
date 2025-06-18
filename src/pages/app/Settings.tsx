
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Building2, Bell, Calendar, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserContext } from '@/hooks/useUserContext';

const Settings = () => {
  const { profile } = useAuth();
  const { firmId } = useUserContext();
  const [firmName, setFirmName] = useState(profile?.firm_name || '');
  const [primaryColor, setPrimaryColor] = useState('#0066cc');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Firm Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Firm Branding
          </CardTitle>
          <CardDescription>
            Customize your firm's appearance and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firm-name">Firm Name</Label>
              <Input
                id="firm-name"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <Button>Save Branding Settings</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Email notifications for new clients</Label>
              <Badge variant="outline">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label>SMS alerts for urgent tasks</Label>
              <Badge variant="secondary">Disabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label>Weekly progress reports</Label>
              <Badge variant="outline">Enabled</Badge>
            </div>
          </div>
          <Button variant="outline">Manage Notifications</Button>
        </CardContent>
      </Card>

      {/* Default Report Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Default Report Settings
          </CardTitle>
          <CardDescription>
            Set default parameters for financial reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fiscal-start">Fiscal Year Start</Label>
              <Input
                id="fiscal-start"
                type="date"
                defaultValue="2024-04-01"
              />
            </div>
            <div>
              <Label htmlFor="report-currency">Default Currency</Label>
              <Input
                id="report-currency"
                defaultValue="INR"
                placeholder="INR"
              />
            </div>
          </div>
          <Button variant="outline">Save Report Settings</Button>
        </CardContent>
      </Card>

      {/* Roles & Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Roles & Permissions Overview
          </CardTitle>
          <CardDescription>
            Current role structure in your firm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Partner</span>
              <Badge>Full Access</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Senior Staff</span>
              <Badge variant="secondary">Client Management</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Staff</span>
              <Badge variant="outline">Task Execution</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

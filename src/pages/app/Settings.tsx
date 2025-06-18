
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Upload, Users, FileText, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [firmName, setFirmName] = useState('');
  const [defaultBillingRate, setDefaultBillingRate] = useState('');
  const [autoAssignDeliverables, setAutoAssignDeliverables] = useState(false);
  const [aiCategorization, setAiCategorization] = useState(true);

  const handleSaveGeneral = () => {
    toast({
      title: "Settings Updated",
      description: "General settings have been saved successfully.",
    });
  };

  const handleSaveTemplates = () => {
    toast({
      title: "Templates Updated",
      description: "Deliverable templates have been saved successfully.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Firm Settings</h1>
          <p className="text-muted-foreground">
            Manage your firm's configuration and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure basic firm settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="firmName">Firm Name</Label>
                <Input
                  type="text"
                  id="firmName"
                  placeholder="Enter firm name"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                />
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="billingRate">Default Billing Rate ($/hour)</Label>
                <Input
                  type="number"
                  id="billingRate"
                  placeholder="150"
                  value={defaultBillingRate}
                  onChange={(e) => setDefaultBillingRate(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoAssign"
                  checked={autoAssignDeliverables}
                  onCheckedChange={setAutoAssignDeliverables}
                />
                <Label htmlFor="autoAssign">Auto-assign deliverables to new clients</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="aiCategorization"
                  checked={aiCategorization}
                  onCheckedChange={setAiCategorization}
                />
                <Label htmlFor="aiCategorization">Enable AI document categorization</Label>
              </div>

              <Button onClick={handleSaveGeneral}>Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Deliverable Templates
              </CardTitle>
              <CardDescription>
                Set up default deliverable templates for new clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Monthly Management Accounts</Label>
                  <Textarea
                    placeholder="Template description and requirements..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Annual Tax Returns</Label>
                  <Textarea
                    placeholder="Template description and requirements..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>VAT Returns</Label>
                  <Textarea
                    placeholder="Template description and requirements..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <Button onClick={handleSaveTemplates}>Save Templates</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Role Permissions
              </CardTitle>
              <CardDescription>
                Configure access control for different user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Partner Permissions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Full client access</span>
                      <Switch defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Team management</span>
                      <Switch defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Firm settings</span>
                      <Switch defaultChecked disabled />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Senior Staff Permissions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Assigned client access</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Deliverable management</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Task assignment</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Staff Permissions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Assigned task access</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Document upload</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Client communication</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Branding & Appearance
              </CardTitle>
              <CardDescription>
                Customize your firm's branding and visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Firm Logo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload logo or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                </div>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    id="primaryColor"
                    className="w-12 h-10"
                    defaultValue="#3b82f6"
                  />
                  <Input
                    type="text"
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    id="secondaryColor"
                    className="w-12 h-10"
                    defaultValue="#64748b"
                  />
                  <Input
                    type="text"
                    placeholder="#64748b"
                    className="flex-1"
                  />
                </div>
              </div>

              <Button>Save Branding Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

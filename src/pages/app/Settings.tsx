
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings as SettingsIcon, Save, Building, Upload, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AppSettings = () => {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  const [firmData, setFirmData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
      fetchFirmData();
    }
  }, [profile]);

  const fetchFirmData = async () => {
    if (!profile?.firm_id) return;

    try {
      const { data, error } = await supabase
        .from('firms')
        .select('*')
        .eq('id', profile.firm_id)
        .single();

      if (error) throw error;

      if (data) {
        setFirmData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          postal_code: data.postal_code || '',
          country: data.country || ''
        });
      }
    } catch (error) {
      console.error('Error fetching firm data:', error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.firm_id) return;

    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.firm_id}/logo.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('firm-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('firm-assets')
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!profile?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFirm = async () => {
    if (!profile?.firm_id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('firms')
        .update(firmData)
        .eq('id', profile.firm_id);

      if (error) throw error;
      toast.success('Firm information updated successfully');
    } catch (error) {
      console.error('Error updating firm:', error);
      toast.error('Failed to update firm information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your firm and personal preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              />
            </div>

            <Button onClick={updateProfile} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Firm Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Firm Information
            </CardTitle>
            <CardDescription>
              Update your firm details and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Firm Logo Upload */}
            <div>
              <Label>Firm Logo</Label>
              <div className="flex items-center space-x-4 mt-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={logoUrl} />
                  <AvatarFallback>
                    <Building className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="firm_name">Firm Name</Label>
              <Input
                id="firm_name"
                value={firmData.name}
                onChange={(e) => setFirmData({...firmData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firm_email">Firm Email</Label>
                <Input
                  id="firm_email"
                  type="email"
                  value={firmData.email}
                  onChange={(e) => setFirmData({...firmData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="firm_phone">Firm Phone</Label>
                <Input
                  id="firm_phone"
                  value={firmData.phone}
                  onChange={(e) => setFirmData({...firmData, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={firmData.address}
                onChange={(e) => setFirmData({...firmData, address: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={firmData.city}
                  onChange={(e) => setFirmData({...firmData, city: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={firmData.state}
                  onChange={(e) => setFirmData({...firmData, state: e.target.value})}
                />
              </div>
            </div>

            <Button onClick={updateFirm} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Save Firm Info
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppSettings;

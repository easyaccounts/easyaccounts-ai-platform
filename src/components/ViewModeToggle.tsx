
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Building2, Users } from 'lucide-react';

const ViewModeToggle = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only show for accounting firm users (not business owners)
  if (profile?.user_group !== 'accounting_firm') {
    return null;
  }

  const isClientView = location.pathname.startsWith('/app/clients/') || location.pathname === '/app/select-client';
  const isFirmView = location.pathname.startsWith('/app/dashboard') || (!location.pathname.startsWith('/app/clients') && !location.pathname.startsWith('/client'));

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // Switch to client view - go to client selection
      navigate('/app/select-client');
    } else {
      // Switch to firm view - go to main dashboard
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Building2 className="w-4 h-4 text-blue-600" />
        <Label htmlFor="view-toggle" className="text-sm font-medium">
          Firm
        </Label>
      </div>
      
      <Switch
        id="view-toggle"
        checked={isClientView}
        onCheckedChange={handleToggle}
      />
      
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4 text-green-600" />
        <Label htmlFor="view-toggle" className="text-sm font-medium">
          Clients
        </Label>
      </div>
    </div>
  );
};

export default ViewModeToggle;

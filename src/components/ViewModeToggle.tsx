
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Building2, User } from 'lucide-react';
import { useUserContext } from '@/hooks/useUserContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ClientSelector from './client/ClientSelector';

const ViewModeToggle = () => {
  const { profile } = useAuth();
  const { currentView, setCurrentView, loading } = useUserContext();
  const navigate = useNavigate();

  // Only show toggle for accounting firm users (chartered accountants)
  if (profile?.user_group !== 'accounting_firm') {
    return null;
  }

  const handleViewChange = async (mode: 'firm' | 'client') => {
    await setCurrentView(mode);
    
    // Redirect to appropriate dashboard
    if (mode === 'firm') {
      navigate('/app/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Eye className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="px-3 py-2">
            {currentView === 'firm' ? (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Firm View
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Client View
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleViewChange('firm')}>
            <Building2 className="w-4 h-4 mr-2" />
            Firm View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleViewChange('client')}>
            <User className="w-4 h-4 mr-2" />
            Client View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {currentView === 'client' && <ClientSelector />}
    </div>
  );
};

export default ViewModeToggle;

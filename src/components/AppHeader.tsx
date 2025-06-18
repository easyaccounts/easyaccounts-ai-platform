
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Building2, User, LogOut, ChevronDown } from 'lucide-react';
import { useUserContext } from '@/hooks/useUserContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ClientSelector from './client/ClientSelector';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

const AppHeader = () => {
  const { profile, signOut } = useAuth();
  const { currentView, setCurrentView } = useUserContext();
  const navigate = useNavigate();

  const handleViewChange = async (mode: 'firm' | 'client') => {
    await setCurrentView(mode);
    
    // Redirect to appropriate dashboard
    if (mode === 'firm') {
      navigate('/app/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (!profile?.first_name) return 'U';
    return profile.first_name.charAt(0).toUpperCase() + 
           (profile.last_name?.charAt(0).toUpperCase() || '');
  };

  const canSwitchViews = () => {
    return profile?.user_group === 'accounting_firm' && 
           ['partner', 'senior_staff', 'staff'].includes(profile?.user_role || '');
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          {canSwitchViews() && (
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
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
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
          )}
          
          {/* Client Selector (only in client view) */}
          {currentView === 'client' && <ClientSelector />}
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown />
          
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile?.user_role} • {profile?.user_group}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canSwitchViews() && (
                <>
                  <DropdownMenuItem onClick={() => handleViewChange('firm')}>
                    <Building2 className="mr-2 h-4 w-4" />
                    <span>Switch to Firm View</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewChange('client')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Switch to Client View</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

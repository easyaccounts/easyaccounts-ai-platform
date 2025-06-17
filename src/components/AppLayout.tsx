
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart3,
  Users,
  FileText,
  CheckSquare,
  MessageSquare,
  Upload,
  PieChart,
  Settings,
  UserPlus,
  Menu,
  X,
  LogOut,
  Home,
  Activity,
  Briefcase,
  FolderOpen
} from 'lucide-react';
import ViewModeToggle from './ViewModeToggle';
import ClientViewBanner from './ClientViewBanner';
import { useSessionContext } from '@/hooks/useSessionContext';
import { useClientContext } from '@/hooks/useClientContext';

const AppLayout = () => {
  const { profile, signOut } = useAuth();
  const { viewMode } = useSessionContext();
  const { selectedClient } = useClientContext();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define navigation items based on user group, role, and view mode
  const getNavigationItems = () => {
    if (!profile) return [];

    const userGroup = profile.user_group;
    const userRole = profile.user_role;

    // Business Owner Group - no view switching
    if (userGroup === 'business_owner') {
      const baseItems = [
        { name: 'Dashboard', href: '/app', icon: Home },
        { name: 'Reports', href: '/app/reports', icon: PieChart },
        { name: 'Deliverables', href: '/app/deliverables', icon: CheckSquare },
        { name: 'Requests', href: '/app/requests', icon: MessageSquare },
        { name: 'Documents', href: '/app/documents', icon: FolderOpen },
        { name: 'Activity', href: '/app/activity', icon: Activity },
      ];

      if (userRole === 'management') {
        baseItems.splice(-1, 0, { name: 'Business Settings', href: '/app/business-settings', icon: Settings });
      } else if (userRole === 'accounting_team') {
        baseItems.splice(2, 0, 
          { name: 'Journal Entries', href: '/app/journal-entries', icon: FileText },
          { name: 'Uploads', href: '/app/uploads', icon: Upload }
        );
      }

      return baseItems;
    }

    // Accounting Firm Group (Chartered Accountant) - view mode dependent
    if (userGroup === 'accounting_firm') {
      if (viewMode === 'firm') {
        // Firm View Navigation
        const firmItems = [
          { name: 'Dashboard', href: '/app', icon: Home },
        ];

        if (['partner', 'senior_staff'].includes(userRole)) {
          firmItems.push(
            { name: 'Clients', href: '/app/clients', icon: Users },
            { name: 'Deliverables', href: '/app/deliverables', icon: CheckSquare }
          );
        }

        if (userRole === 'partner') {
          firmItems.push(
            { name: 'Manage Team', href: '/app/team', icon: UserPlus },
            { name: 'Assign Clients', href: '/app/assign-clients', icon: UserPlus }
          );
        }

        firmItems.push(
          { name: 'Tasks', href: '/app/tasks', icon: Briefcase },
          { name: 'Activity', href: '/app/activity', icon: Activity }
        );

        if (userRole === 'partner') {
          firmItems.push({ name: 'Firm Settings', href: '/app/settings', icon: Settings });
        }

        return firmItems;
      } else {
        // Client View Navigation
        const clientItems = [
          { name: 'Dashboard', href: '/app', icon: Home },
        ];

        if (['partner', 'senior_staff'].includes(userRole)) {
          clientItems.push(
            { name: 'Reports', href: '/app/reports', icon: PieChart },
            { name: 'Deliverables', href: '/app/deliverables', icon: CheckSquare },
            { name: 'Requests', href: '/app/requests', icon: MessageSquare },
            { name: 'Documents', href: '/app/documents', icon: FolderOpen },
            { name: 'Activity', href: '/app/activity', icon: Activity }
          );
        } else if (userRole === 'staff') {
          clientItems.push(
            { name: 'Journal Entries', href: '/app/journal-entries', icon: FileText },
            { name: 'Uploads', href: '/app/uploads', icon: Upload },
            { name: 'Documents', href: '/app/documents', icon: FolderOpen },
            { name: 'Activity', href: '/app/activity', icon: Activity }
          );
        }

        return clientItems;
      }
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getUserGroupLabel = () => {
    if (profile?.user_group === 'accounting_firm') return 'CA Firm';
    if (profile?.user_group === 'business_owner') return 'Business';
    return profile?.user_group;
  };

  const shouldShowViewBanner = () => {
    return profile?.user_group === 'accounting_firm' && viewMode === 'client' && selectedClient;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">EasyAccounts.ai</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Info in Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getInitials(profile?.first_name, profile?.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile?.firm_name || profile?.business_name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {navigationItems.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ViewModeToggle userRole={profile?.user_role} userGroup={profile?.user_group} />
              
              <div className="hidden md:flex items-center space-x-2">
                <Badge variant="secondary">{profile?.user_role}</Badge>
                <Badge variant="outline">{getUserGroupLabel()}</Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(profile?.first_name, profile?.last_name)}
                      </AvatarFallback>
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
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/app/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Client View Banner */}
        {shouldShowViewBanner() && <ClientViewBanner />}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;

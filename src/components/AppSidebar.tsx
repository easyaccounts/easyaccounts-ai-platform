
import { Home, Users, FileText, Settings, UserCheck, Upload, CheckSquare, Building2, BarChart3, MessageSquare, LogOut, Eye } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserContext } from "@/hooks/useUserContext";
import ViewToggle from "./ViewToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AppSidebar = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { currentView, loading, availableClients, currentClientId, setCurrentClient } = useUserContext();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading || !profile) {
    return (
      <Sidebar>
        <SidebarHeader className="border-b p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">EasyAccounts.ai</h2>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const getFirmNavigationItems = () => {
    const baseItems = [
      { title: "Dashboard", url: "/app/dashboard", icon: Home },
    ];

    if (profile.user_role === 'partner') {
      baseItems.push(
        { title: "Clients", url: "/app/clients", icon: Building2 },
        { title: "Team Management", url: "/app/team", icon: Users },
        { title: "Assign Clients", url: "/app/assign-clients", icon: UserCheck },
        { title: "Reports", url: "/app/reports", icon: BarChart3 },
        { title: "Settings", url: "/app/settings", icon: Settings }
      );
    } else if (['senior_staff', 'staff'].includes(profile.user_role)) {
      baseItems.push(
        { title: "My Tasks", url: "/app/my-tasks", icon: CheckSquare },
        { title: "Deliverables", url: "/app/deliverables", icon: FileText },
        { title: "Uploads", url: "/app/uploads", icon: Upload }
      );
    }

    return baseItems;
  };

  const getClientNavigationItems = () => {
    if (!currentClientId) return [];
    
    return [
      { title: "Dashboard", url: "/client/dashboard", icon: Home },
      { title: "Deliverables", url: "/client/deliverables", icon: FileText },
      { title: "Reports", url: "/client/reports", icon: BarChart3 },
      { title: "Requests", url: "/client/requests", icon: MessageSquare },
      { title: "Transactions", url: "/client/transactions", icon: Upload },
      { title: "Uploads", url: "/client/uploads", icon: Upload },
      { title: "Settings", url: "/client/settings", icon: Settings },
    ];
  };

  const navigationItems = currentView === 'client' ? getClientNavigationItems() : getFirmNavigationItems();

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">EasyAccounts.ai</h2>
            <p className="text-xs text-muted-foreground">
              {currentView === 'client' ? 'Client Portal' : 'Firm Portal'}
            </p>
          </div>
        </div>

        {/* View Toggle */}
        {(['partner', 'senior_staff', 'staff'].includes(profile.user_role)) && (
          <ViewToggle />
        )}

        {/* Client Selector for Client View */}
        {currentView === 'client' && availableClients.length > 0 && (
          <div className="mt-4">
            <Select value={currentClientId || ""} onValueChange={setCurrentClient}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select client..." />
              </SelectTrigger>
              <SelectContent>
                {availableClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {currentView === 'client' ? 'Client Tools' : 'Firm Management'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentView === 'client' && !currentClientId && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="p-4 text-center text-sm text-muted-foreground">
                Please select a client to view navigation options
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;


import { Home, Users, FileText, Settings, UserCheck, Upload, CheckSquare, Building2, BarChart3, MessageSquare, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserContext } from "@/hooks/useUserContext";
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

const AppSidebar = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { currentView } = useUserContext();

  const handleSignOut = async () => {
    await signOut();
  };

  // Get menu items based on user role and current view
  const getMenuItems = () => {
    if (!profile) return [];

    const isClientView = currentView === 'client';
    const { user_group, user_role } = profile;

    // Client view navigation
    if (isClientView) {
      return [
        { title: "Dashboard", url: "/client/dashboard", icon: Home },
        { title: "Deliverables", url: "/client/deliverables", icon: FileText },
        { title: "Reports", url: "/client/reports", icon: BarChart3 },
        { title: "Requests", url: "/client/requests", icon: MessageSquare },
        { title: "Documents", url: "/client/documents", icon: Upload },
      ];
    }

    // Firm view navigation based on role
    if (user_group === 'accounting_firm') {
      if (user_role === 'partner') {
        return [
          { title: "Dashboard", url: "/app/dashboard", icon: Home },
          { title: "Clients", url: "/app/clients", icon: Building2 },
          { title: "Deliverables", url: "/app/deliverables", icon: FileText },
          { title: "Team Management", url: "/app/team", icon: Users },
          { title: "Assign Clients", url: "/app/assign-clients", icon: UserCheck },
          { title: "My Tasks", url: "/app/tasks", icon: CheckSquare },
          { title: "Reports", url: "/app/reports", icon: BarChart3 },
          { title: "Requests", url: "/app/requests", icon: MessageSquare },
          { title: "Transactions", url: "/app/transactions", icon: Upload },
        ];
      } else if (['senior_staff', 'staff'].includes(user_role)) {
        return [
          { title: "Dashboard", url: "/app/dashboard", icon: Home },
          { title: "My Clients", url: "/app/clients", icon: Building2 },
          { title: "Deliverables", url: "/app/deliverables", icon: FileText },
          { title: "My Tasks", url: "/app/tasks", icon: CheckSquare },
          { title: "Reports", url: "/app/reports", icon: BarChart3 },
          { title: "Requests", url: "/app/requests", icon: MessageSquare },
          { title: "Transactions", url: "/app/transactions", icon: Upload },
        ];
      }
    }

    // Business owner navigation
    if (user_group === 'business_owner') {
      return [
        { title: "Dashboard", url: "/app/dashboard", icon: Home },
        { title: "Reports", url: "/app/reports", icon: BarChart3 },
        { title: "Transactions", url: "/app/transactions", icon: Upload },
        { title: "Settings", url: "/app/settings", icon: Settings },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
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
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {currentView === 'client' ? 'Client Menu' : 'Firm Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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

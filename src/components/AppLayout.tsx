
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useSessionContext } from "@/hooks/useSessionContext";
import ClientViewBanner from "@/components/ClientViewBanner";
import ViewModeToggle from "@/components/ViewModeToggle";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { Separator } from "@/components/ui/separator";

export default function AppLayout() {
  const { user } = useAuth();
  const { viewMode } = useSessionContext();

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <ViewModeToggle />
            </div>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
            </div>
          </div>
        </header>
        
        {viewMode === 'client' && <ClientViewBanner />}
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

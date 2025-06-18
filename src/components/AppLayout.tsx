
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useUserContext } from "@/hooks/useUserContext";
import ClientViewBanner from "@/components/ClientViewBanner";
import ViewModeToggle from "@/components/ViewModeToggle";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { Separator } from "@/components/ui/separator";

export default function AppLayout() {
  const { user } = useAuth();
  const { currentView, loading } = useUserContext();

  console.log('AppLayout render:', { user: !!user, currentView, loading });

  if (!user) {
    console.log('AppLayout: No user, returning null');
    return null;
  }

  if (loading) {
    console.log('AppLayout: Loading user context');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('AppLayout: Rendering main layout');
  return (
    <SidebarProvider>
      <Sidebar />
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
        
        {currentView === 'client' && <ClientViewBanner />}
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useUserContext } from "@/hooks/useUserContext";
import { ClientContextProvider } from "@/hooks/useClientContext";
import ClientViewBanner from "@/components/ClientViewBanner";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

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
    <ClientContextProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          
          {currentView === 'client' && <ClientViewBanner />}
          
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ClientContextProvider>
  );
}

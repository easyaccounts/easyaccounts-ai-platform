
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SessionContextProvider } from "@/hooks/useSessionContext";
import { ClientContextProvider } from "@/hooks/useClientContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/app/Dashboard";
import Clients from "./pages/app/Clients";
import TeamManagement from "./pages/app/TeamManagement";
import AssignClients from "./pages/app/AssignClients";
import Deliverables from "./pages/app/Deliverables";
import Reports from "./pages/app/Reports";
import Requests from "./pages/app/Requests";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <SessionContextProvider>
              <ClientContextProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/app" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Dashboard />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="team" element={<TeamManagement />} />
                    <Route path="assign-clients" element={<AssignClients />} />
                    <Route path="deliverables" element={<Deliverables />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="requests" element={<Requests />} />
                  </Route>
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </ClientContextProvider>
            </SessionContextProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

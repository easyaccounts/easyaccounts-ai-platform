
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UserContextProvider } from "@/hooks/useUserContext";
import RouteGuard from "@/components/RouteGuard";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import ClientLayout from "@/components/ClientLayout";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/app/Dashboard";
import Clients from "./pages/app/Clients";
import TeamManagement from "./pages/app/TeamManagement";
import AssignClients from "./pages/app/AssignClients";
import Deliverables from "./pages/app/Deliverables";
import DeliverableTasks from "./pages/app/DeliverableTasks";
import DeliverableMessages from "./pages/app/DeliverableMessages";
import MyTasks from "./pages/app/MyTasks";
import Reports from "./pages/app/Reports";
import Requests from "./pages/app/Requests";
import Transactions from "./pages/app/Transactions";
import ClientDashboard from "./pages/client/Dashboard";
import ClientDeliverables from "./pages/client/Deliverables";
import ClientReports from "./pages/client/Reports";
import ClientRequests from "./pages/client/Requests";
import ClientDocuments from "./pages/client/Documents";
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
            <UserContextProvider>
              <RouteGuard>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Firm/App Routes */}
                  <Route path="/app" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="team" element={<TeamManagement />} />
                    <Route path="assign-clients" element={<AssignClients />} />
                    <Route path="deliverables" element={<Deliverables />} />
                    <Route path="deliverables/:deliverableId/tasks" element={<DeliverableTasks />} />
                    <Route path="deliverables/:deliverableId/messages" element={<DeliverableMessages />} />
                    <Route path="my-tasks" element={<MyTasks />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="requests" element={<Requests />} />
                    <Route path="transactions" element={<Transactions />} />
                  </Route>

                  {/* Client Routes */}
                  <Route path="/client" element={
                    <ProtectedRoute>
                      <ClientLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/client/dashboard" replace />} />
                    <Route path="dashboard" element={<ClientDashboard />} />
                    <Route path="deliverables" element={<ClientDeliverables />} />
                    <Route path="reports" element={<ClientReports />} />
                    <Route path="requests" element={<ClientRequests />} />
                    <Route path="documents" element={<ClientDocuments />} />
                  </Route>

                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </RouteGuard>
            </UserContextProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

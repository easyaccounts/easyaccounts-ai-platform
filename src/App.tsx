
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { UserContextProvider } from '@/hooks/useUserContext';
import RouteGuard from '@/components/RouteGuard';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import AppLayout from '@/components/AppLayout';
import ClientLayout from '@/components/ClientLayout';
import Dashboard from '@/pages/app/Dashboard';
import Clients from '@/pages/app/Clients';
import Settings from '@/pages/app/Settings';
import Deliverables from '@/pages/app/Deliverables';
import Tasks from '@/pages/app/Tasks';
import MyTasks from '@/pages/app/MyTasks';
import Transactions from '@/pages/app/Transactions';
import Uploads from '@/pages/app/Uploads';
import Reports from '@/pages/app/Reports';
import Requests from '@/pages/app/Requests';
import Assignments from '@/pages/app/Assignments';
import SelectClient from '@/pages/app/SelectClient';
import DeliverableMessages from '@/pages/app/DeliverableMessages';
import DeliverableTasks from '@/pages/app/DeliverableTasks';
import ClientDashboard from '@/pages/app/ClientDashboard';
import ClientDeliverables from '@/pages/app/ClientDeliverables';
import ClientDocuments from '@/pages/client/Documents';
import ClientDashboardPage from '@/pages/client/Dashboard';
import ClientDeliverablesList from '@/pages/client/Deliverables';
import ClientReports from '@/pages/client/Reports';
import ClientRequests from '@/pages/client/Requests';
import ClientTransactions from '@/pages/client/Transactions';
import ClientUploads from '@/pages/client/Uploads';
import ClientSettings from '@/pages/client/Settings';
import ClientTasks from '@/pages/client/Tasks';
import ClientTeam from '@/pages/client/Team';
import NotFound from '@/pages/NotFound';
import AssignClients from '@/pages/app/AssignClients';
import TeamManagement from '@/pages/app/TeamManagement';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserContextProvider>
          <Toaster />
          <BrowserRouter>
            <RouteGuard>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected app routes for accounting firms */}
                <Route path="/app" element={<AppLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="clients" element={<Clients />} />
                  {/* Client-specific routes for firm members */}
                  <Route path="clients/:clientId/dashboard" element={<ClientDashboard />} />
                  <Route path="clients/:clientId/deliverables" element={<ClientDeliverables />} />
                  <Route path="clients/:clientId/documents" element={<ClientDocuments />} />
                  <Route path="clients/:clientId/requests" element={<Requests />} />
                  <Route path="clients/:clientId/transactions" element={<Transactions />} />
                  <Route path="assign-clients" element={<AssignClients />} />
                  <Route path="team" element={<TeamManagement />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="deliverables" element={<Deliverables />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="my-tasks" element={<MyTasks />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="uploads" element={<Uploads />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="requests" element={<Requests />} />
                  <Route path="assignments" element={<Assignments />} />
                  <Route path="select-client" element={<SelectClient />} />
                  <Route path="deliverable/:id/messages" element={<DeliverableMessages />} />
                  <Route path="deliverable/:id/tasks" element={<DeliverableTasks />} />
                </Route>

                {/* Protected client routes for business owners */}
                <Route path="/client" element={<ClientLayout />}>
                  <Route path="dashboard" element={<ClientDashboardPage />} />
                  <Route path="deliverables" element={<ClientDeliverablesList />} />
                  <Route path="reports" element={<ClientReports />} />
                  <Route path="requests" element={<ClientRequests />} />
                  <Route path="transactions" element={<ClientTransactions />} />
                  <Route path="uploads" element={<ClientUploads />} />
                  <Route path="settings" element={<ClientSettings />} />
                  <Route path="tasks" element={<ClientTasks />} />
                  <Route path="documents" element={<ClientDocuments />} />
                  <Route path="team" element={<ClientTeam />} />
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RouteGuard>
          </BrowserRouter>
        </UserContextProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;


import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
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
import ClientDashboardPage from '@/pages/client/Dashboard';
import ClientDeliverables from '@/pages/client/Deliverables';
import ClientReports from '@/pages/client/Reports';
import ClientRequests from '@/pages/client/Requests';
import ClientTransactions from '@/pages/client/Transactions';
import ClientUploads from '@/pages/client/Uploads';
import ClientSettings from '@/pages/client/Settings';
import ClientTasks from '@/pages/client/Tasks';
import ClientDocuments from '@/pages/client/Documents';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import AssignClients from '@/pages/app/AssignClients';
import TeamManagement from '@/pages/app/TeamManagement';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected app routes */}
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
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

          {/* Protected client routes */}
          <Route path="/client" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<ClientDashboardPage />} />
            <Route path="deliverables" element={<ClientDeliverables />} />
            <Route path="reports" element={<ClientReports />} />
            <Route path="requests" element={<ClientRequests />} />
            <Route path="transactions" element={<ClientTransactions />} />
            <Route path="uploads" element={<ClientUploads />} />
            <Route path="settings" element={<ClientSettings />} />
            <Route path="tasks" element={<ClientTasks />} />
            <Route path="documents" element={<ClientDocuments />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

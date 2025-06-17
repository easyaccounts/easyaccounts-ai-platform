
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/features" element={<Landing />} />
            <Route path="/pricing" element={<Landing />} />
            <Route path="/about" element={<Landing />} />
            
            {/* Protected App Routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<div className="p-8 text-center text-gray-500">Clients module coming soon...</div>} />
              <Route path="invoices" element={<div className="p-8 text-center text-gray-500">Invoices module coming soon...</div>} />
              <Route path="transactions" element={<div className="p-8 text-center text-gray-500">Transactions module coming soon...</div>} />
              <Route path="expenses" element={<div className="p-8 text-center text-gray-500">Expenses module coming soon...</div>} />
              <Route path="deliverables" element={<div className="p-8 text-center text-gray-500">Deliverables module coming soon...</div>} />
              <Route path="requests" element={<div className="p-8 text-center text-gray-500">Requests module coming soon...</div>} />
              <Route path="upload" element={<div className="p-8 text-center text-gray-500">Magic Upload module coming soon...</div>} />
              <Route path="reports" element={<div className="p-8 text-center text-gray-500">Reports module coming soon...</div>} />
              <Route path="accounts" element={<div className="p-8 text-center text-gray-500">Chart of Accounts module coming soon...</div>} />
              <Route path="team" element={<div className="p-8 text-center text-gray-500">Team module coming soon...</div>} />
              <Route path="settings" element={<div className="p-8 text-center text-gray-500">Settings module coming soon...</div>} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

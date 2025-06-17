
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { SessionContextProvider } from '@/hooks/useSessionContext';
import { ClientContextProvider } from '@/hooks/useClientContext';

// Lazy load components
const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const AppLayout = lazy(() => import('@/components/AppLayout'));
const Dashboard = lazy(() => import('@/pages/app/Dashboard'));
const TeamManagement = lazy(() => import('@/pages/app/TeamManagement'));
const Clients = lazy(() => import('@/pages/app/Clients'));
const Deliverables = lazy(() => import('@/pages/app/Deliverables'));
const Reports = lazy(() => import('@/pages/app/Reports'));
const Requests = lazy(() => import('@/pages/app/Requests'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ProtectedRoute = lazy(() => import('@/components/ProtectedRoute'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionContextProvider>
          <ClientContextProvider>
            <Toaster />
            <TooltipProvider>
              <Router>
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/app" element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Dashboard />} />
                      <Route path="team" element={<TeamManagement />} />
                      <Route path="clients" element={<Clients />} />
                      <Route path="deliverables" element={<Deliverables />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="requests" element={<Requests />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Router>
            </TooltipProvider>
          </ClientContextProvider>
        </SessionContextProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

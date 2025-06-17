
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type Client = Database['public']['Tables']['clients']['Row'];

interface ClientContextType {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  availableClients: Client[];
  loading: boolean;
  canAccessClient: (clientId: string) => boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientContextProvider = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchAvailableClients();
    }
  }, [profile]);

  const fetchAvailableClients = async () => {
    try {
      if (!profile) return;

      let query = supabase.from('clients').select('*');

      // Filter clients based on user role and assignments
      if (profile.user_role === 'staff') {
        // Staff can only see assigned clients - first get their assigned client IDs
        const { data: assignments } = await supabase
          .from('user_assignments')
          .select('client_id')
          .eq('user_id', profile.id);

        if (assignments && assignments.length > 0) {
          const clientIds = assignments.map(a => a.client_id);
          query = query.in('id', clientIds);
        } else {
          // No assignments, return empty array
          setAvailableClients([]);
          setLoading(false);
          return;
        }
      } else if (['partner', 'senior_staff', 'management'].includes(profile.user_role)) {
        // Partners, seniors, and management can see all firm clients
        if (profile.firm_id) {
          query = query.eq('firm_id', profile.firm_id);
        }
      } else if (profile.user_role === 'client') {
        // Clients can only see their own record
        query = query.eq('id', profile.business_id);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching clients:', error);
      } else {
        setAvailableClients(data || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccessClient = (clientId: string): boolean => {
    return availableClients.some(client => client.id === clientId);
  };

  return (
    <ClientContext.Provider value={{
      selectedClient,
      setSelectedClient,
      availableClients,
      loading,
      canAccessClient,
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClientContext must be used within a ClientContextProvider');
  }
  return context;
};

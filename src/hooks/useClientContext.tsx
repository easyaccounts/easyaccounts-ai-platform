
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

      let clientsData: Client[] = [];

      if (profile.user_role === 'partner') {
        // Partners can see all firm clients
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('firm_id', profile.firm_id)
          .order('name');

        if (error) throw error;
        clientsData = data || [];
      } else if (['senior_staff', 'staff'].includes(profile.user_role)) {
        // Staff and seniors can only see assigned clients
        const { data: assignments, error } = await supabase
          .from('team_client_assignments')
          .select(`
            client:clients(*)
          `)
          .eq('team_member_id', profile.id);

        if (error) throw error;
        clientsData = assignments?.map(a => a.client).filter(Boolean) || [];
      } else if (profile.user_role === 'client') {
        // Clients can only see their own record
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', profile.business_id)
          .order('name');

        if (error) throw error;
        clientsData = data || [];
      }

      setAvailableClients(clientsData);
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

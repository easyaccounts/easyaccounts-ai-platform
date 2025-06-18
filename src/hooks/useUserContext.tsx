
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type Client = Database['public']['Tables']['clients']['Row'];

interface UserContextType {
  userGroup: 'accounting_firm' | 'business_owner' | null;
  userRole: string | null;
  currentView: 'firm' | 'client';
  firmId: string | null;
  currentClientId: string | null;
  assignedClients: Client[];
  loading: boolean;
  setCurrentView: (view: 'firm' | 'client') => Promise<void>;
  setCurrentClient: (clientId: string | null) => void;
  canAccessClient: (clientId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuth();
  const [currentView, setCurrentViewState] = useState<'firm' | 'client'>('firm');
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [assignedClients, setAssignedClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      initializeUserContext();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  const initializeUserContext = async () => {
    try {
      // Fetch assigned clients
      await fetchAssignedClients();
      
      // Fetch current view mode
      await fetchViewMode();
      
      // For business owners, default to firm view (which is their business view)
      if (profile?.user_group === 'business_owner') {
        setCurrentViewState('firm');
      }
    } catch (error) {
      console.error('Error initializing user context:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedClients = async () => {
    if (!profile) return;

    try {
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
      } else if (profile.user_group === 'business_owner') {
        // Business owners see their own business as a client
        if (profile.business_id) {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('business_id', profile.business_id);

          if (error) throw error;
          clientsData = data || [];
        }
      }

      setAssignedClients(clientsData);
    } catch (error) {
      console.error('Error fetching assigned clients:', error);
    }
  };

  const fetchViewMode = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('view_mode')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching view mode:', error);
      } else {
        setCurrentViewState((data?.view_mode as 'firm' | 'client') || 'firm');
      }
    } catch (error) {
      console.error('Error fetching view mode:', error);
    }
  };

  const setCurrentView = async (view: 'firm' | 'client') => {
    try {
      const { error } = await supabase.rpc('set_user_view_mode', {
        new_mode: view
      });

      if (error) {
        console.error('Error setting view mode:', error);
        return;
      }

      setCurrentViewState(view);
    } catch (error) {
      console.error('Error setting view mode:', error);
    }
  };

  const setCurrentClient = (clientId: string | null) => {
    setCurrentClientId(clientId);
  };

  const canAccessClient = (clientId: string): boolean => {
    if (profile?.user_role === 'partner') return true;
    return assignedClients.some(client => client.id === clientId);
  };

  return (
    <UserContext.Provider value={{
      userGroup: profile?.user_group || null,
      userRole: profile?.user_role || null,
      currentView,
      firmId: profile?.firm_id || null,
      currentClientId,
      assignedClients,
      loading,
      setCurrentView,
      setCurrentClient,
      canAccessClient,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};

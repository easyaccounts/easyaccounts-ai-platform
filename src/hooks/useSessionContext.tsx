
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SessionContextType {
  viewMode: 'firm' | 'client';
  setViewMode: (mode: 'firm' | 'client') => Promise<void>;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [viewMode, setViewModeState] = useState<'firm' | 'client'>('firm');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchViewMode();
    } else {
      setLoading(false);
    }
  }, [user]);

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
        setViewModeState(data?.view_mode || 'firm');
      }
    } catch (error) {
      console.error('Error fetching view mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const setViewMode = async (mode: 'firm' | 'client') => {
    try {
      const { error } = await supabase.rpc('set_user_view_mode', {
        new_mode: mode
      });

      if (error) {
        console.error('Error setting view mode:', error);
        return;
      }

      setViewModeState(mode);
    } catch (error) {
      console.error('Error setting view mode:', error);
    }
  };

  return (
    <SessionContext.Provider value={{
      viewMode,
      setViewMode,
      loading,
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionContextProvider');
  }
  return context;
};

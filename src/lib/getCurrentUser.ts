
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const getCurrentUser = async (): Promise<{
  user: any | null;
  profile: Profile | null;
  error: string | null;
}> => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return { user: null, profile: null, error: sessionError.message };
    }

    if (!session?.user) {
      return { user: null, profile: null, error: 'No authenticated user' };
    }

    // Safely fetch profile using maybeSingle()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return { user: session.user, profile: null, error: profileError.message };
    }

    return { user: session.user, profile, error: null };
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return { user: null, profile: null, error: 'Unexpected error occurred' };
  }
};

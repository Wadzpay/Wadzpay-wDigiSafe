
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSessionManagement = (isAuthenticated: boolean) => {
  // Ensure we have an auth session before accessing protected resources
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session && isAuthenticated) {
        // If we're supposed to be authenticated but no session exists, refresh
        await supabase.auth.refreshSession();
      }
    };
    
    checkSession();
  }, [isAuthenticated]);
};

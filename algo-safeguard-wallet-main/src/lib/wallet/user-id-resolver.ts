
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility functions for resolving user IDs from various sources
 * This includes session, localStorage, and database lookups
 */

// Retrieve the user ID for wallet queries with exhaustive fallbacks
export const getQueryUserId = async (sessionUserId?: string): Promise<string | null> => {
  // Get the stored user ID from localStorage
  const storedUserId = localStorage.getItem('user_id');
  
  if (storedUserId) {
    console.log('Found stored user ID:', storedUserId);
  } else {
    console.log('No stored user ID found');
  }
  
  // Determine which user ID to use
  let queryUserId = sessionUserId || storedUserId;
  
  if (!queryUserId) {
    // Try to refresh session as a last resort
    console.log('No user ID found, attempting to refresh session...');
    const { data: refreshedSession } = await supabase.auth.refreshSession();
    
    const refreshedUserId = refreshedSession?.session?.user?.id;
    
    if (refreshedUserId) {
      console.log('Got user ID from refreshed session:', refreshedUserId);
      localStorage.setItem('user_id', refreshedUserId);
      queryUserId = refreshedUserId;
    }
  }
  
  if (!queryUserId) {
    // If still no user ID, try to get it from customers table using customer_id
    const customerId = localStorage.getItem('customer_id');
    if (customerId) {
      try {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('customer_id', customerId)
          .maybeSingle();
          
        if (customerData && customerData.id) {
          console.log('Retrieved user ID from customers table:', customerData.id);
          localStorage.setItem('user_id', customerData.id);
          queryUserId = customerData.id;
        } else if (customerError) {
          console.error('Error retrieving customer data:', customerError);
        }
      } catch (err) {
        console.error('Error querying customers table:', err);
      }
    }
  }
  
  return queryUserId || null;
};

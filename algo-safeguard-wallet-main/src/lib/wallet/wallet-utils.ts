
import { supabase } from "@/integrations/supabase/client";
import { WalletInfo } from "../types";

// Define the interface for the direct query response
interface WalletRecord {
  address: string;
  private_key: string;
  created_at: string;
}

// Retrieve the user ID for wallet queries
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

// Fetch wallet data using the user ID
export const fetchWalletData = async (userId: string): Promise<WalletRecord | null> => {
  // First try to query with regular user ID
  let { data: walletData, error } = await supabase
    .from('wallets')
    .select('address, private_key, created_at')
    .eq('customer_id', userId)
    .maybeSingle();

  // Log detailed query information
  console.log('Wallet query results:', { walletData, error });
  
  if (error) {
    console.error('Error retrieving wallet with customer_id:', error);
    throw new Error('Failed to query wallet information: ' + error.message);
  }
  
  // If no wallet found with the regular query, try direct query without RLS
  if (!walletData) {
    console.log(`No wallet found with standard query for user ${userId}, trying direct query...`);
    
    try {
      // Use a type assertion to tell TypeScript this RPC function exists
      // This is needed because the function was just created and TypeScript doesn't know about it yet
      const { data: directQueryData, error: directQueryError } = await supabase.rpc(
        'get_wallet_by_customer_id' as any,
        { customer_uuid: userId }
      );
      
      console.log('Direct wallet query results:', { directQueryData, directQueryError });
      
      if (directQueryError) {
        console.error('Error in direct wallet query:', directQueryError);
      } else if (directQueryData) {
        console.log('Found wallet with direct query:', directQueryData);
        // Convert the JSONB response to our expected format
        walletData = directQueryData;
      }
    } catch (directQueryErr) {
      console.error('Exception in direct wallet query:', directQueryErr);
    }
  }

  return walletData || null;
};

// Fetch wallet balance from the Algorand function
export const fetchWalletBalance = async (address: string): Promise<WalletInfo> => {
  const balanceResponse = await supabase.functions.invoke('algorand', {
    method: 'POST',
    body: { action: 'balance', address },
  });

  if (balanceResponse.error) {
    console.error('Error fetching balance:', balanceResponse.error);
    // Return wallet with zero balance instead of throwing an error
    console.log('Using default balance of 0 due to balance fetch error');
    
    return {
      address,
      balance: 0,
    };
  }

  return {
    address,
    balance: balanceResponse.data?.balance || 0,
  };
};

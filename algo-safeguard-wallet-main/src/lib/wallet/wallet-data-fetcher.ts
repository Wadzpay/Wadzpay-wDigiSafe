
import { supabase } from "@/integrations/supabase/client";

// Define the interface for the direct query response
interface WalletRecord {
  address: string;
  private_key: string;
  created_at: string;
}

/**
 * Fetch wallet data using the user ID
 * Includes fallbacks for different query methods
 */
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
      const { data: directQueryData, error: directQueryError } = await supabase.rpc(
        'get_wallet_by_customer_id',
        { customer_uuid: userId }
      );
      
      console.log('Direct wallet query results:', { directQueryData, directQueryError });
      
      if (directQueryError) {
        console.error('Error in direct wallet query:', directQueryError);
      } else if (directQueryData) {
        console.log('Found wallet with direct query:', directQueryData);
        
        // Parse and validate the JSONB response to ensure it has the correct structure
        if (typeof directQueryData === 'object' && directQueryData !== null) {
          const jsonData = directQueryData as Record<string, any>;
          
          // Check if the response has all required fields
          if (jsonData.address && jsonData.private_key && jsonData.created_at) {
            walletData = {
              address: jsonData.address as string,
              private_key: jsonData.private_key as string,
              created_at: jsonData.created_at as string
            };
          }
        }
      }
    } catch (directQueryErr) {
      console.error('Exception in direct wallet query:', directQueryErr);
    }
  }

  return walletData || null;
};

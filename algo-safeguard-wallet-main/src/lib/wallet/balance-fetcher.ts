
import { supabase } from "@/integrations/supabase/client";
import { WalletInfo } from "../types";

/**
 * Fetch wallet balance from the Algorand function
 * Returns a WalletInfo object with the address and balance
 */
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

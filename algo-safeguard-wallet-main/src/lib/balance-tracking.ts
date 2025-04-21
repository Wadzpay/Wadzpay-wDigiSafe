
import { supabase } from "@/integrations/supabase/client";
import { WalletInfo } from "./types";

// Log a balance change to the database
export const logBalanceChange = async (
  wallet: WalletInfo,
  previousBalance: number,
  triggerSource: string
): Promise<void> => {
  try {
    // Get current user ID from session or localStorage
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || localStorage.getItem('user_id');
    
    if (!userId) {
      console.error('No user ID available for balance tracking');
      return;
    }

    // Calculate change value
    const changeValue = wallet.balance - previousBalance;
    
    // Skip if no actual change (prevents unnecessary logs)
    if (changeValue === 0) {
      console.log('No balance change detected, skipping log entry');
      return;
    }

    console.log(`Logging balance change: ${previousBalance} → ${wallet.balance} (${changeValue > 0 ? '+' : ''}${changeValue})`);
    
    // Insert the balance change log with correct customer_id for RLS
    const { error } = await supabase
      .from('balance_change_log')
      .insert({
        customer_id: userId,
        wallet_address: wallet.address,
        previous_balance: previousBalance,
        new_balance: wallet.balance,
        change_value: changeValue,
        trigger_source: triggerSource
      });

    if (error) {
      console.error('Error logging balance change:', error);
    }
  } catch (error) {
    console.error('Error in logBalanceChange:', error);
  }
};

// Fetch the last recorded balance from the logs
export const getLastRecordedBalance = async (walletAddress: string): Promise<number | null> => {
  try {
    // Get current user ID
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || localStorage.getItem('user_id');
    
    if (!userId) {
      console.error('No user ID available for fetching last recorded balance');
      return null;
    }

    // Get the most recent balance log entry
    const { data, error } = await supabase
      .from('balance_change_log')
      .select('new_balance')
      .eq('customer_id', userId)
      .eq('wallet_address', walletAddress)
      .order('updated_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching last recorded balance:', error);
      return null;
    }

    return data ? Number(data.new_balance) : null;
  } catch (error) {
    console.error('Error in getLastRecordedBalance:', error);
    return null;
  }
};

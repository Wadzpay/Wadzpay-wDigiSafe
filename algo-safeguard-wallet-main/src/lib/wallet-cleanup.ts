
import { supabase } from "@/integrations/supabase/client";

// Clear all wallet data
export const clearWalletData = async (): Promise<void> => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    // Get the wallet to be deleted
    const { data: wallet, error: fetchError } = await supabase
      .from('wallets')
      .select('address')
      .maybeSingle();

    if (fetchError) {
      console.log('Error finding wallet to delete:', fetchError);
      return;
    }

    if (!wallet) {
      console.log('No wallet found to delete');
      return;
    }

    // Delete any transactions associated with this wallet
    if (wallet?.address) {
      const { error: txError } = await supabase
        .from('transactions')
        .delete()
        .eq('wallet_address', wallet.address);

      if (txError) {
        console.error('Error deleting transactions:', txError);
        throw new Error('Failed to delete transaction data');
      }
    }

    // Delete the wallet itself
    const { error: walletError } = await supabase
      .from('wallets')
      .delete()
      .eq('address', wallet.address);

    if (walletError) {
      console.error('Error deleting wallet:', walletError);
      throw new Error('Failed to delete wallet data');
    }

    console.log('All wallet data successfully cleared');
  } catch (error) {
    console.error('Error in clearWalletData:', error);
    throw new Error('Failed to clear wallet data');
  }
};


// Unified transaction logging using only the transactions table
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "./types";

/**
 * Logs transactions to our transactions table
 * @param transactions Array of transactions to log
 * @param walletAddress The wallet address the transactions belong to
 */
export const logTransactions = async (
  transactions: Transaction[] | Transaction, 
  walletAddress: string
): Promise<void> => {
  try {
    console.log('Logging transactions to transactions table');
    
    // Ensure transactions is always an array
    const txArray = Array.isArray(transactions) ? transactions : [transactions];
    
    if (txArray.length === 0) {
      console.log('No transactions to log');
      return;
    }
    
    // Check if we have an active session instead of trying to authenticate
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || localStorage.getItem('user_id');
    
    // If no active session, store transactions in localStorage for later processing
    if (!sessionData?.session) {
      console.log('No active session, storing transactions for later processing');
      const pendingTx = JSON.parse(localStorage.getItem('pending_transactions') || '{"transactions":[]}');
      pendingTx.walletAddress = walletAddress;
      pendingTx.transactions = [...(pendingTx.transactions || []), ...txArray];
      localStorage.setItem('pending_transactions', JSON.stringify(pendingTx));
      return;
    }
    
    // Format transactions for insertion
    const formattedTransactions = txArray.map(tx => ({
      wallet_address: walletAddress,
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      fee: tx.fee || 0,
      note: tx.note || '',
      type: tx.type,
      tx_hash: tx.txHash,
      timestamp: tx.timestamp,
      confirmations: tx.confirmations || 0,
      customer_id: userId || null // Include the customer ID
    }));
    
    // Insert transactions in batches to avoid hitting size limits
    const BATCH_SIZE = 20;
    for (let i = 0; i < formattedTransactions.length; i += BATCH_SIZE) {
      const batch = formattedTransactions.slice(i, i + BATCH_SIZE);
      
      // Use supabase client with authenticated session
      const { error } = await supabase
        .from('transactions')
        .upsert(batch, { 
          onConflict: 'tx_hash',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error('Error logging transactions batch:', error);
        // Store failed batch for retry when connection is restored
        const pendingTx = JSON.parse(localStorage.getItem('pending_transactions') || '{"transactions":[]}');
        pendingTx.walletAddress = walletAddress;
        pendingTx.transactions = [...(pendingTx.transactions || []), ...batch];
        localStorage.setItem('pending_transactions', JSON.stringify(pendingTx));
      }
    }
  } catch (error) {
    console.error('Error in logTransactions:', error);
    // Store transactions for later if there's an error
    const pendingTx = JSON.parse(localStorage.getItem('pending_transactions') || '{"transactions":[]}');
    const txArray = Array.isArray(transactions) ? transactions : [transactions];
    pendingTx.walletAddress = walletAddress;
    pendingTx.transactions = [...(pendingTx.transactions || []), ...txArray];
    localStorage.setItem('pending_transactions', JSON.stringify(pendingTx));
  }
};

/**
 * Syncs transaction history with our transactions table
 * @param walletAddress The wallet address to sync transactions for
 * @param fetchNewTransactions Function to fetch new transactions
 */
export const syncTransactionHistory = async (
  walletAddress: string,
  fetchNewTransactions: (lastTimestamp?: string) => Promise<Transaction[]>
): Promise<void> => {
  try {
    // Try to process any pending transactions first
    const pendingTxJson = localStorage.getItem('pending_transactions');
    if (pendingTxJson) {
      try {
        const pendingTx = JSON.parse(pendingTxJson);
        if (pendingTx.walletAddress === walletAddress && pendingTx.transactions?.length > 0) {
          console.log(`Trying to process ${pendingTx.transactions.length} pending transactions`);
          await logTransactions(pendingTx.transactions, walletAddress);
          // Only clear if the current wallet matches the pending transactions wallet
          localStorage.removeItem('pending_transactions');
        }
      } catch (e) {
        console.error('Error processing pending transactions:', e);
      }
    }
    
    // Check if we have an active session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log('No active session available for transaction history sync');
      return;
    }
    
    // Get the latest transaction timestamp from our transactions table
    const { data: latestTx, error: queryError } = await supabase
      .from('transactions')
      .select('timestamp')
      .eq('wallet_address', walletAddress)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (queryError) {
      console.error('Error retrieving latest transaction:', queryError);
      return;
    }
    
    // Fetch new transactions since the latest one we have
    const lastTimestamp = latestTx && latestTx.length > 0 ? latestTx[0].timestamp : undefined;
    const newTransactions = await fetchNewTransactions(lastTimestamp);
    
    if (newTransactions.length > 0) {
      console.log(`Logging ${newTransactions.length} transactions to history`);
      await logTransactions(newTransactions, walletAddress);
    }
  } catch (error) {
    console.error('Error in syncTransactionHistory:', error);
  }
};

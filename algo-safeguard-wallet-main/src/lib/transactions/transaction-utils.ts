
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "../types";

// Format a transaction from API response
export const formatTransaction = (tx: any, walletAddress: string): Transaction => {
  // Determine transaction type based on the wallet address
  const isReceive = tx.to === walletAddress;
  const type = isReceive ? 'receive' : 'send';
  
  return {
    id: tx.id || Math.random().toString(36).substring(2, 9),
    txHash: tx.hash,
    type: type,
    amount: parseFloat(tx.amount),
    from: tx.from,
    to: tx.to,
    timestamp: new Date(tx.timestamp).toISOString(),
    confirmations: tx.confirmations || 0,
    fee: parseFloat(tx.fee || '0.001'),
    note: tx.note,
  };
};

// Store transactions in the database
export const storeTransactionsInDatabase = async (
  transactions: Transaction[], 
  wallet: { address: string; customer_id: string }
): Promise<void> => {
  const transactionsToInsert = transactions.map(tx => ({
    customer_id: wallet.customer_id,
    wallet_address: wallet.address,
    tx_hash: tx.txHash,
    type: tx.type,
    amount: tx.amount,
    from: tx.from,
    to: tx.to,
    timestamp: tx.timestamp, // Using the ISO string, not a Date object
    confirmations: tx.confirmations,
    fee: tx.fee,
    note: tx.note || null
  }));

  // Use upsert to avoid duplicate transaction errors
  const { error: insertError } = await supabase
    .from('transactions')
    .upsert(transactionsToInsert, { 
      onConflict: 'tx_hash',
      ignoreDuplicates: true 
    });

  if (insertError) {
    console.error('Error storing transactions in database:', insertError);
    // Don't throw here, we can still continue with the transactions we fetched
  }
};

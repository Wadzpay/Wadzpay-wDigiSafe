
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "../types";
import { formatTransaction } from "./transaction-utils";

// Send transaction API
export const sendTransaction = async (toAddress: string, amount: number, note?: string): Promise<Transaction> => {
  try {
    // First, try to get the user ID from session or localStorage
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || localStorage.getItem('user_id');
    
    if (!userId) {
      console.error('No user ID available for wallet fetch');
      throw new Error('No user ID available. Please log in again.');
    }
    
    // Try the direct query approach first (more reliable)
    let walletData;
    const { data: directQueryData, error: directQueryError } = await supabase.rpc(
      'get_wallet_by_customer_id',
      { customer_uuid: userId }
    );
    
    console.log('Direct wallet query results for transaction:', { directQueryData, directQueryError });
    
    if (directQueryError) {
      console.error('Error in direct wallet query for transaction:', directQueryError);
    } else if (directQueryData) {
      console.log('Found wallet with direct query for transaction');
      walletData = directQueryData;
    }
    
    // Fallback to standard query if direct query fails
    if (!walletData) {
      const { data: standardWallet, error: standardError } = await supabase
        .from('wallets')
        .select('address, private_key, customer_id')
        .eq('customer_id', userId)
        .single();
      
      if (standardError) {
        console.error('Error retrieving wallet with standard query for transaction:', standardError);
      } else {
        walletData = standardWallet;
      }
    }
    
    if (!walletData || !walletData.address || !walletData.private_key) {
      console.error('Could not retrieve valid wallet data for transaction');
      throw new Error('Wallet not found. Please ensure your wallet is set up correctly.');
    }

    // Make sure note is never empty (Tatum API requirement)
    // If note is undefined, null, or empty, set a default note
    const formattedNote = note && note.trim() !== '' 
      ? note.replace(/\s+/g, '') 
      : 'AlgoTransaction'; // Default note if none provided
    
    // Log the transaction request (without the private key for security)
    console.log('Sending transaction to:', toAddress, 'amount:', amount, 'with note:', formattedNote);
    
    // Add a timeout to the edge function call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Transaction request timed out after 30 seconds')), 30000);
    });
    
    // Create the response promise
    const responsePromise = supabase.functions.invoke('algorand', {
      method: 'POST',
      body: {
        action: 'transaction',
        from: walletData.address,
        to: toAddress,
        amount,
        privateKey: walletData.private_key,
        note: formattedNote,
      },
    });
    
    // Race between the response and the timeout
    const response = await Promise.race([responsePromise, timeoutPromise]);

    if (response.error) {
      console.error('Error from algorand edge function:', response.error);
      throw new Error(response.error.message || 'Transaction failed. Please try again.');
    }

    if (!response.data || !response.data.txId) {
      console.error('Invalid response from algorand edge function:', response.data);
      throw new Error('Invalid response from transaction service. Please try again.');
    }

    // Process and format the new transaction
    const newTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      txHash: response.data.txId,
      type: 'send',
      amount: amount,
      from: walletData.address,
      to: toAddress,
      timestamp: new Date().toISOString(),
      confirmations: 0,
      fee: 0.001,
      note: formattedNote,
    };

    // Store the transaction in our database
    const { error: insertError } = await supabase
      .from('transactions')
      .insert({
        customer_id: userId, // Use the user ID instead of wallet.customer_id
        wallet_address: walletData.address,
        tx_hash: newTx.txHash,
        type: newTx.type,
        amount: newTx.amount,
        from: newTx.from,
        to: newTx.to,
        timestamp: newTx.timestamp,
        confirmations: newTx.confirmations,
        fee: newTx.fee,
        note: newTx.note || null
      });

    if (insertError) {
      console.error('Error storing new transaction in database:', insertError);
      // Don't throw here, we can still return the transaction data
    }

    return newTx;
  } catch (error) {
    console.error('Error in sendTransaction:', error);
    
    // Enhance error message based on error type
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Transaction is taking too long to process. Please check your transaction history later.');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds to complete this transaction.');
      } else if (error.message.includes('invalid address')) {
        throw new Error('Invalid recipient address. Please check and try again.');
      } else if (error.message.includes('validation.failed')) {
        throw new Error('Transaction validation failed. Please try again with a different configuration.');
      }
    }
    
    throw error;
  }
};

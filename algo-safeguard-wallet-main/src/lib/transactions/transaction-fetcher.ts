
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "../types";
import { formatTransaction } from "./transaction-utils";

// Get the wallet address for the current user
export async function getWalletAddressForUser(): Promise<string> {
  // Get current user ID from session or localStorage
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id || localStorage.getItem('user_id');
  
  if (!userId) {
    console.error('No user ID available for transaction fetch');
    throw new Error('No user ID available. Please log in again.');
  }
  
  // Try to get wallet using the direct query function
  const { data: walletData, error: walletError } = await supabase.rpc(
    'get_wallet_by_customer_id',
    { customer_uuid: userId }
  );
  
  console.log('Wallet query results:', { walletData, walletError });
  
  if (walletError) {
    console.error('Error in wallet query:', walletError);
    throw new Error('Failed to retrieve wallet information');
  }
  
  if (!walletData) {
    // Fallback to temporary storage if needed
    const tempAddress = localStorage.getItem('temp_wallet_address');
    if (tempAddress) {
      console.log('Using temporary wallet address:', tempAddress);
      return tempAddress;
    }
    
    console.error('No wallet found for user');
    throw new Error('Wallet not found');
  }
  
  // Type assertion to handle the JSON response from RPC
  // The wallet data should have an address property
  const walletDataObj = walletData as { address: string };
  
  if (!walletDataObj.address) {
    console.error('Wallet data does not contain an address:', walletData);
    throw new Error('Invalid wallet data format');
  }
  
  return walletDataObj.address;
}

// Interface for transaction fetch options
export interface TransactionFetchOptions {
  limit?: number;  // Page size for pagination (default is 50)
  next?: string;   // Pagination token for fetching the next page
}

// Paginated transactions response
export interface PaginatedTransactions {
  transactions: Transaction[];
  next: string | null;
}

// Call the edge function to fetch transactions
export async function fetchTransactionsFromAPI(
  walletAddress: string, 
  options?: TransactionFetchOptions
): Promise<PaginatedTransactions> {
  console.log(`Fetching transactions from Algonode Indexer for address: ${walletAddress}`, options);
  
  // Get current user ID from session or localStorage for associating transactions
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id || localStorage.getItem('user_id');
  
  if (!userId) {
    console.log('No user ID available for transaction association, will store without customer_id');
  }
  
  const response = await supabase.functions.invoke('algorand', {
    method: 'POST',
    body: { 
      action: 'transactions', 
      address: walletAddress,
      limit: options?.limit || 50,
      next: options?.next || undefined
    },
  });

  if (response.error) {
    console.error('Error from algorand edge function:', response.error);
    throw new Error(response.error.message);
  }
  
  if (!response.data) {
    console.error('Invalid response from API:', response.data);
    return { transactions: [], next: null };
  }

  // Extract transactions and next token from response
  const { transactions: rawTransactions = [], next = null } = response.data;
  
  if (!Array.isArray(rawTransactions)) {
    console.error('Invalid transactions format:', rawTransactions);
    return { transactions: [], next: null };
  }

  // Process and format transactions
  const formattedTransactions: Transaction[] = rawTransactions.map((tx: any) => 
    formatTransaction(tx, walletAddress)
  );
  
  console.log(`Formatted ${formattedTransactions.length} transactions from API, next token: ${next}`);
  
  // Store transactions in the transactions table, not transaction_history table
  if (formattedTransactions.length > 0) {
    try {
      // Format transactions for insertion
      const transactionRecords = formattedTransactions.map(tx => ({
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
        customer_id: userId || null // Associate transactions with the customer ID
      }));
      
      // Upsert transactions to transactions table
      const { error } = await supabase
        .from('transactions')
        .upsert(transactionRecords, { 
          onConflict: 'tx_hash',
          ignoreDuplicates: false 
        });
        
      if (error) {
        console.error('Error storing transactions:', error);
      }
    } catch (err) {
      console.error('Failed to store transactions:', err);
    }
  }
  
  return { 
    transactions: formattedTransactions,
    next
  };
}

// Admin function to fetch all transactions
export async function fetchAllTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('timestamp', { ascending: false });
    
  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
  
  return data || [];
}

// Admin function to fetch transactions for a specific wallet
export async function fetchTransactionsForWallet(walletAddress: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('wallet_address', walletAddress)
    .order('timestamp', { ascending: false });
    
  if (error) {
    console.error('Error fetching wallet transactions:', error);
    throw new Error('Failed to fetch wallet transactions');
  }
  
  return data || [];
}

// Admin function to fetch all wallets
export async function fetchAllWallets() {
  const { data, error } = await supabase
    .from('wallets')
    .select('*');
    
  if (error) {
    console.error('Error fetching wallets:', error);
    throw new Error('Failed to fetch wallets');
  }
  
  return data || [];
}

// Admin function to fetch all customers
export async function fetchAllCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*');
    
  if (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers');
  }
  
  return data || [];
}


import { Transaction } from "../types";
import { 
  getWalletAddressForUser, 
  fetchTransactionsFromAPI, 
  TransactionFetchOptions,
  PaginatedTransactions
} from "./transaction-fetcher";

// Get transactions directly from Tatum API via edge function
export const getTransactions = async (options?: TransactionFetchOptions): Promise<PaginatedTransactions> => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    console.log('Fetching transactions directly from Tatum API...', options);
    
    // Get the wallet address
    const walletAddress = await getWalletAddressForUser();
    console.log(`Using wallet address for transactions: ${walletAddress}`);

    // Get the transactions with options (default pageSize is 10)
    return await fetchTransactionsFromAPI(walletAddress, options);
  } catch (error) {
    console.error('Error in getTransactions:', error);
    throw new Error('Failed to get transaction history');
  }
};

// Function to get new transactions since the last known transaction timestamp
export const getNewTransactions = async (lastTxTimestamp?: string): Promise<Transaction[]> => {
  if (lastTxTimestamp) {
    // Use appropriate options - removing 'from' property which doesn't exist in the type
    const result = await getTransactions({
      limit: 50
    });
    
    // Filter transactions by timestamp after fetching
    const newTransactions = result.transactions.filter(tx => 
      new Date(tx.timestamp) > new Date(lastTxTimestamp)
    );
    
    return newTransactions;
  }
  
  // If no timestamp provided, get all transactions
  const result = await getTransactions();
  return result.transactions;
};


import { useFetchTransactions } from './useFetchTransactions';
import { useTransactionUpdates } from './useTransactionUpdates';
import { useSendTransaction } from './useSendTransaction';
import { Transaction } from '@/lib/api';
import { logTransactions } from '@/lib/transaction-logging';
import { useRef } from 'react';

export const useTransactions = (wallet: any, fetchWalletInfo: () => Promise<any>) => {
  const lastFetchTimeRef = useRef<number>(0);
  const MIN_FETCH_INTERVAL = 25000; // 25 seconds (reduced from 30)
  
  const { 
    transactions, 
    isLoading: isFetchLoading, 
    setTransactions, 
    fetchTransactions: originalFetchTransactions 
  } = useFetchTransactions(wallet);
  
  const { 
    fetchNewTransactions: originalFetchNewTransactions 
  } = useTransactionUpdates(wallet, transactions, setTransactions);
  
  const { 
    isLoading: isSendLoading, 
    handleSendTransaction 
  } = useSendTransaction(fetchWalletInfo, originalFetchTransactions);

  // Rate-limited fetchTransactions
  const fetchTransactions = async (): Promise<Transaction[]> => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    if (timeSinceLastFetch < MIN_FETCH_INTERVAL) {
      console.log(`Rate limiting transactions fetch: only ${Math.round(timeSinceLastFetch/1000)}s since last fetch (limit: 25s)`);
      return transactions;
    }
    
    lastFetchTimeRef.current = now;
    return originalFetchTransactions();
  };
  
  // Rate-limited fetchNewTransactions
  const fetchNewTransactions = async (lastTimestamp?: string): Promise<Transaction[]> => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    if (timeSinceLastFetch < MIN_FETCH_INTERVAL) {
      console.log(`Rate limiting new transactions fetch: only ${Math.round(timeSinceLastFetch/1000)}s since last fetch (limit: 25s)`);
      return [];
    }
    
    lastFetchTimeRef.current = now;
    return originalFetchNewTransactions(lastTimestamp);
  };

  // Combine loading states
  const isLoading = isFetchLoading || isSendLoading;

  // Enhanced send transaction function that logs to our transactions table
  const sendTransaction = async (to: string, amount: number, note?: string): Promise<Transaction> => {
    // Use the original send function
    const txResult = await handleSendTransaction(to, amount, note);
    
    // Log the transaction to our history using only the transactions table
    if (wallet && txResult) {
      await logTransactions(txResult, wallet.address).catch(err => {
        console.log('Transaction logging error (will retry later):', err);
      });
    }
    
    return txResult;
  };

  return {
    transactions,
    isLoading,
    setTransactions,
    fetchTransactions,
    fetchNewTransactions,
    handleSendTransaction: sendTransaction
  };
};

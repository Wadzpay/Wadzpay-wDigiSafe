
import { useEffect } from 'react';
import { Transaction } from '@/lib/types';

interface TransactionSyncProps {
  isAuthenticated: boolean;
  wallet: any;
  isActive: boolean;
  fetchNewTransactions: (lastTimestamp?: string) => Promise<Transaction[]>;
  lastTransactionFetchTimeRef: React.RefObject<number>;
  MIN_TRANSACTION_FETCH_INTERVAL: number;
}

export const useTransactionSync = ({
  isAuthenticated,
  wallet,
  isActive,
  fetchNewTransactions,
  lastTransactionFetchTimeRef,
  MIN_TRANSACTION_FETCH_INTERVAL
}: TransactionSyncProps) => {
  // Set up polling for new transactions when the app is active
  useEffect(() => {
    if (!isAuthenticated || !wallet || !isActive) return;
    
    const transactionPollInterval = setInterval(async () => {
      const currentTime = Date.now();
      const timeSinceLastFetch = currentTime - (lastTransactionFetchTimeRef.current || 0);
      
      if (timeSinceLastFetch >= MIN_TRANSACTION_FETCH_INTERVAL) {
        console.log('Polling for new transactions...');
        // Update the last transaction fetch time
        if (lastTransactionFetchTimeRef.current !== undefined) {
          // Use a temporary variable to avoid the TypeScript error
          const newValue = currentTime;
          // Only update if it's a mutable ref
          if (!Object.isFrozen(lastTransactionFetchTimeRef)) {
            (lastTransactionFetchTimeRef as any).current = newValue;
          }
        }
        
        await fetchNewTransactions();
      } else {
        console.log(`Skipping transaction poll - only ${Math.round(timeSinceLastFetch/1000)}s since last fetch (limit: ${MIN_TRANSACTION_FETCH_INTERVAL/1000}s)`);
      }
    }, 60000); // Poll every 60 seconds
    
    return () => clearInterval(transactionPollInterval);
  }, [isAuthenticated, wallet, isActive, fetchNewTransactions, lastTransactionFetchTimeRef, MIN_TRANSACTION_FETCH_INTERVAL]);
};

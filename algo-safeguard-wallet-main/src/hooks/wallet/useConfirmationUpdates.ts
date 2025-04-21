
import { useEffect, useRef } from 'react';

interface ConfirmationUpdatesProps {
  isAuthenticated: boolean;
  fetchTransactions: () => Promise<any>;
  lastTransactionFetchTimeRef: React.RefObject<number>;
  MIN_TRANSACTION_FETCH_INTERVAL: number;
}

export const useConfirmationUpdates = ({
  isAuthenticated,
  fetchTransactions,
  lastTransactionFetchTimeRef,
  MIN_TRANSACTION_FETCH_INTERVAL
}: ConfirmationUpdatesProps) => {
  // Set up an interval to check for transaction confirmations
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const confirmationInterval = setInterval(async () => {
      // Check if enough time has passed since the last transaction fetch
      const currentTime = Date.now();
      const timeSinceLastFetch = currentTime - (lastTransactionFetchTimeRef.current || 0);
      
      if (timeSinceLastFetch >= MIN_TRANSACTION_FETCH_INTERVAL) {
        console.log('Checking for transaction confirmation updates...');
        // Update the last transaction fetch time
        if (lastTransactionFetchTimeRef.current !== undefined) {
          // Use a temporary variable to avoid the TypeScript error
          const newValue = currentTime;
          // Only update if it's a mutable ref
          if (!Object.isFrozen(lastTransactionFetchTimeRef)) {
            (lastTransactionFetchTimeRef as any).current = newValue;
          }
        }
        
        await fetchTransactions();
      } else {
        console.log(`Skipping confirmation check - only ${Math.round(timeSinceLastFetch/1000)}s since last fetch (limit: ${MIN_TRANSACTION_FETCH_INTERVAL/1000}s)`);
      }
    }, 60000); // Check every 60 seconds
    
    return () => clearInterval(confirmationInterval);
  }, [isAuthenticated, fetchTransactions, lastTransactionFetchTimeRef, MIN_TRANSACTION_FETCH_INTERVAL]);
};

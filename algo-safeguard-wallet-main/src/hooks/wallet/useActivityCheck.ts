
import { useRef, useEffect } from 'react';
import { syncTransactionHistory } from '@/lib/transaction-logging';
import { Transaction } from '@/lib/types';

interface ActivityCheckProps {
  isAuthenticated: boolean;
  wallet: any;
  hasNewActivity: boolean;
  resetNewActivity: () => void;
  fetchNewTransactions: (lastTimestamp?: string) => Promise<Transaction[]>;
}

export const useActivityCheck = ({
  isAuthenticated,
  wallet,
  hasNewActivity,
  resetNewActivity,
  fetchNewTransactions
}: ActivityCheckProps) => {
  const checkOnActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activityCheckInProgressRef = useRef<boolean>(false);
  
  // Add a ref to track last balance check time
  const lastBalanceCheckTimeRef = useRef<number>(0);
  // Add a ref to track last transaction fetch time to prevent continuous fetching
  const lastTransactionFetchTimeRef = useRef<number>(0);
  const MIN_TRANSACTION_FETCH_INTERVAL = 30000; // 30 seconds minimum between transaction fetches

  // Check for balance updates when there's new user activity
  useEffect(() => {
    if (!hasNewActivity || !isAuthenticated || !wallet || activityCheckInProgressRef.current) {
      return;
    }
    
    // Debounce activity checks to prevent too many API calls
    if (checkOnActivityTimeoutRef.current) {
      clearTimeout(checkOnActivityTimeoutRef.current);
    }
    
    checkOnActivityTimeoutRef.current = setTimeout(async () => {
      if (activityCheckInProgressRef.current) return;
      
      try {
        activityCheckInProgressRef.current = true;
        console.log('User activity detected, checking if we should update balance...');
        
        // Reset the activity flag early to prevent more triggers during this process
        resetNewActivity();
        
        // Check if 15 seconds have passed since the last balance check
        const currentTime = Date.now();
        const timeSinceLastCheck = currentTime - lastBalanceCheckTimeRef.current;
        
        if (timeSinceLastCheck >= 15000) { // 15 seconds
          console.log('15 seconds since last balance check, performing new check');
          lastBalanceCheckTimeRef.current = currentTime;
          
          // Check if enough time has passed since the last transaction fetch
          const timeSinceLastTransactionFetch = currentTime - lastTransactionFetchTimeRef.current;
          if (timeSinceLastTransactionFetch >= MIN_TRANSACTION_FETCH_INTERVAL) {
            console.log('30 seconds since last transaction fetch, syncing transactions');
            lastTransactionFetchTimeRef.current = currentTime;
            
            // Also refresh transactions
            if (wallet.address) {
              await syncTransactionHistory(wallet.address, fetchNewTransactions);
            }
          } else {
            console.log(`Skipping transaction sync - only ${timeSinceLastTransactionFetch/1000}s since last fetch (limit: 30s)`);
          }
        } else {
          console.log(`Skipping balance check - only ${timeSinceLastCheck/1000}s since last check (limit: 15s)`);
        }
      } catch (error) {
        console.error("Error handling user activity:", error);
      } finally {
        activityCheckInProgressRef.current = false;
      }
    }, 2000); // Debounce for 2 seconds
    
    return () => {
      if (checkOnActivityTimeoutRef.current) {
        clearTimeout(checkOnActivityTimeoutRef.current);
      }
    };
  }, [hasNewActivity, isAuthenticated, wallet, fetchNewTransactions, resetNewActivity]);

  return {
    lastBalanceCheckTimeRef,
    lastTransactionFetchTimeRef,
    MIN_TRANSACTION_FETCH_INTERVAL
  };
};

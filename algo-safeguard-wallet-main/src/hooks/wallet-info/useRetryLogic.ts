
import { useEffect, useRef } from 'react';

interface RetryLogicProps {
  isLoading: boolean;
  isFetching: boolean;
  wallet: any;
  fetchWalletInfo: () => Promise<any>;
}

export const useRetryLogic = ({
  isLoading,
  isFetching,
  wallet,
  fetchWalletInfo
}: RetryLogicProps) => {
  const lastFetchAttemptRef = useRef<number>(0);
  const MIN_FETCH_INTERVAL = 30000; // 30 seconds strictly enforced

  // Helper function to check if we should attempt a fetch
  const shouldAttemptFetch = (): boolean => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchAttemptRef.current;
    
    if (timeSinceLastFetch < MIN_FETCH_INTERVAL) {
      console.log(`Fetch throttled: only ${Math.round(timeSinceLastFetch/1000)}s since last fetch (limit: 30s)`);
      return false;
    }
    
    lastFetchAttemptRef.current = now;
    return true;
  };

  // Simple effect for initial fetch only
  useEffect(() => {
    // Only run once when the component mounts and wallet is not loaded
    if (!wallet && shouldAttemptFetch()) {
      console.log('Initial wallet fetch after mount');
      fetchWalletInfo();
    }
  }, [wallet, fetchWalletInfo]);

  // Simple timer-based fetch every 30 seconds, regardless of user activity
  useEffect(() => {
    const fetchTimer = setInterval(() => {
      if (shouldAttemptFetch()) {
        console.log('Scheduled 30-second wallet refresh');
        fetchWalletInfo();
      }
    }, MIN_FETCH_INTERVAL);
    
    return () => clearInterval(fetchTimer);
  }, [fetchWalletInfo]);
};

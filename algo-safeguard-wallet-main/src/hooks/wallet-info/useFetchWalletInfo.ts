
import { useCallback, useRef } from 'react';
import { getWalletInfo } from '@/lib/wallet-api';
import { WalletInfo } from '@/lib/types';
import { toast } from 'sonner';
import { useFetchOperation } from './useFetchOperation';
import { useWalletState } from './useWalletState';
import { useLocation } from 'react-router-dom';

export const useFetchWalletInfo = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/index';
  const lastFetchTimeRef = useRef<number>(0);
  const MIN_FETCH_INTERVAL = 25000; // 25 seconds (reduced from 30)
  const fetchAttemptsRef = useRef<number>(0);
  const maxLoginFetchAttempts = 3;
  
  const {
    wallet,
    setWallet,
    balance,
    setBalance,
    isLoading,
    setIsLoading,
    walletError,
    setWalletError
  } = useWalletState();
  
  const {
    isFetching,
    setIsFetching,
    loadingRetries,
    setLoadingRetries,
    isMnemonicPage,
    prepareFetchingEnvironment,
    handleFetchError,
    retryFetch
  } = useFetchOperation();

  const fetchWalletInfo = useCallback(async () => {
    // Skip fetching on login page
    if (isLoginPage) {
      console.log('On login page, skipping wallet info fetch');
      return null;
    }
    
    // Special case: For first few fetches after login, bypass rate limiting
    const isPostLoginFetch = fetchAttemptsRef.current < maxLoginFetchAttempts;
    
    // Strictly enforce 25-second rate limiting except for initial post-login fetches
    if (!isPostLoginFetch) {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      
      if (timeSinceLastFetch < MIN_FETCH_INTERVAL) {
        console.log(`Rate limiting wallet fetch: only ${Math.round(timeSinceLastFetch/1000)}s since last fetch (limit: 25s)`);
        return null;
      }
    } else {
      console.log(`Post-login fetch attempt ${fetchAttemptsRef.current + 1}/${maxLoginFetchAttempts}, bypassing rate limiting`);
      fetchAttemptsRef.current++;
    }
    
    // Prevent multiple simultaneous fetches
    if (isFetching) {
      console.log('Already fetching wallet info, skipping this request');
      return null;
    }
    
    // Update last fetch time
    lastFetchTimeRef.current = Date.now();
    
    setIsFetching(true);
    setIsLoading(true);
    setWalletError(null);
    
    try {
      console.log('Fetching wallet info...');
      
      // Make sure we have all necessary user IDs in environment
      await prepareFetchingEnvironment();
      
      // Direct wallet retrieval with all fallbacks included
      const walletInfo = await getWalletInfo({ maxRetries: 2 });
      
      if (walletInfo && walletInfo.walletInfo) {
        console.log('Wallet info fetched successfully:', walletInfo.walletInfo.address);
        setWallet(walletInfo.walletInfo);
        setBalance(walletInfo.walletInfo.balance);
      } else {
        throw new Error('Wallet info is empty or undefined');
      }
      
      setLoadingRetries(0); // Reset retry counter on success
      setIsLoading(false);
      setIsFetching(false);
      return walletInfo.walletInfo;
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      
      // Process fetch error and get error details
      const { errorMessage, walletError: errorType, isNewRegistration } = handleFetchError(error, fetchWalletInfo);
      setWalletError(errorType);
      
      // For post-login fetches, be more aggressive with retries
      if (isPostLoginFetch && fetchAttemptsRef.current < maxLoginFetchAttempts) {
        const retryDelay = 2000; // 2 seconds
        console.log(`Post-login fetch failed, scheduling retry ${fetchAttemptsRef.current + 1}/${maxLoginFetchAttempts} in ${retryDelay/1000}s`);
        
        setTimeout(() => {
          setIsFetching(false);
          fetchWalletInfo();
        }, retryDelay);
      }
      // Only retry once if it's an authentication or wallet-not-found error
      else if (loadingRetries < 1 && (error instanceof Error && 
          (error.message.includes('No wallet found') || 
           error.message.includes('Not authenticated')))) {
        
        setLoadingRetries(prev => prev + 1);
        const retryDelay = 5000; // 5 seconds
        console.log(`Scheduling single retry in ${retryDelay/1000}s`);
        
        setTimeout(() => {
          setIsFetching(false);
          fetchWalletInfo();
        }, retryDelay);
      } else {
        setIsLoading(false);
        if (!isMnemonicPage) {
          toast.error(errorMessage);
        }
        setIsFetching(false);
      }
      
      return null;
    }
  }, [
    isLoginPage,
    isFetching, 
    setIsFetching, 
    setIsLoading, 
    setWalletError, 
    prepareFetchingEnvironment,
    setWallet, 
    setBalance, 
    loadingRetries, 
    setLoadingRetries, 
    handleFetchError, 
    isMnemonicPage
  ]);

  return {
    wallet,
    balance,
    isLoading,
    walletError,
    setWallet,
    setBalance,
    fetchWalletInfo,
    isLoginPage
  };
};

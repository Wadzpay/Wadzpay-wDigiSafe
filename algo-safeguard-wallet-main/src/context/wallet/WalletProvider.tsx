
import React, { useState, useRef, useEffect } from 'react';
import WalletContext from './WalletContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useWalletOperations } from '@/hooks/useWalletOperations';
import { useWalletWebsocket } from '@/hooks/useWalletWebsocket';
import MnemonicDialog from '@/components/MnemonicDialog';
import { syncTransactionHistory } from '@/lib/transaction-logging';
import { useLocation } from 'react-router-dom';
import { useSessionManagement } from './useSessionManagement';
import { logBalanceChange } from '@/lib/balance-tracking';
import { useBalanceTracking } from '@/hooks/useBalanceTracking';
import { useTransactionHistory } from '@/context/wallet/useTransactionHistory';
import { useBalanceUpdates } from '@/context/wallet/useBalanceUpdates';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const lastTransactionFetchTimeRef = useRef<number>(0);
  const MIN_TRANSACTION_FETCH_INTERVAL = 25000; // 25 seconds (reduced from 30)
  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/index';
  const firstLoadRef = useRef(true);
  const postLoginFetchAttemptedRef = useRef(false); // Track if post-login fetch was attempted
  
  // Use the session management hook
  useSessionManagement(isAuthenticated);
  
  const {
    wallet,
    balance,
    transactions,
    isLoading,
    mnemonic,
    showMnemonicDialog,
    walletError,
    setBalance,
    fetchWalletInfo,
    fetchTransactions,
    fetchNewTransactions,
    handleSendTransaction,
    handleCloseMnemonicDialog,
    isLoginPage: isLoginPageFromHook
  } = useWalletOperations();

  // Skip wallet operations on the login page
  const skipWalletOps = isLoginPage || isLoginPageFromHook;

  // Define the balance update and new transactions handlers first
  const handleBalanceUpdate = (newBalance: number) => {
    if (newBalance !== balance) {
      if (newBalance > balance) {
        toast.success(`Received new ALGO deposit! Balance updated to ${newBalance.toFixed(8)} ALGO.`);
      } else if (newBalance < balance) {
        toast.info(`Balance decreased to ${newBalance.toFixed(8)} ALGO.`);
      }
      setBalance(newBalance);
    }
  };

  const handleNewTransactions = async () => {
    // Skip on login page
    if (skipWalletOps) return;
    
    // Check if enough time has passed since the last transaction fetch
    const currentTime = Date.now();
    const timeSinceLastFetch = currentTime - lastTransactionFetchTimeRef.current;
    
    if (timeSinceLastFetch < MIN_TRANSACTION_FETCH_INTERVAL) {
      console.log(`Skipping new transactions fetch - only ${timeSinceLastFetch/1000}s since last fetch (limit: 25s)`);
      return;
    }
    
    lastTransactionFetchTimeRef.current = currentTime;
    console.log('Fetching new transactions');
    
    const newTransactions = await fetchNewTransactions(lastTransactionTimestampRef.current);
    if (newTransactions.length > 0) {
      // Update the last transaction timestamp
      const sortedTransactions = [...newTransactions].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      lastTransactionTimestampRef.current = sortedTransactions[0].timestamp;
    }
  };

  // Use the balance tracking hook with authentication
  const { lastKnownBalanceRef, previousBalance } = useBalanceTracking({
    isAuthenticated,
    wallet,
    balance,
    onBalanceUpdate: handleBalanceUpdate,
    onNewTransactions: handleNewTransactions
  });

  // Use the transaction history hook
  const { lastTransactionTimestampRef } = useTransactionHistory(
    isAuthenticated && !skipWalletOps,
    wallet,
    fetchTransactions,
    fetchNewTransactions
  );
  
  // Use the wallet websocket hook
  useWalletWebsocket(
    isAuthenticated && !skipWalletOps,
    wallet,
    balance,
    handleBalanceUpdate,
    handleNewTransactions,
    fetchTransactions,
    fetchNewTransactions
  );

  // Improved listener for wallet fetch needed event
  useEffect(() => {
    if (!isAuthenticated || skipWalletOps) return;
    
    const handleWalletFetchNeeded = async (event: Event) => {
      // Cast the event to CustomEvent to access the detail property
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail || {};
      
      console.log('Wallet fetch needed event received:', detail);
      
      // Set a small delay to allow auth state to fully update
      setTimeout(async () => {
        if (!wallet && !isLoading) {
          console.log('Triggering immediate wallet fetch after login event');
          postLoginFetchAttemptedRef.current = true;
          await fetchWalletInfo();
          
          // If we successfully got the wallet, also fetch transactions
          if (wallet) {
            console.log('Wallet fetched successfully, now fetching transactions');
            await fetchTransactions();
          }
        }
      }, 300);
    };
    
    // Listen for the specific wallet fetch event
    window.addEventListener('wallet-fetch-needed', handleWalletFetchNeeded);
    
    return () => {
      window.removeEventListener('wallet-fetch-needed', handleWalletFetchNeeded);
    };
  }, [isAuthenticated, skipWalletOps, wallet, isLoading, fetchWalletInfo, fetchTransactions]);

  // Effect to check wallet connection after navigation
  useEffect(() => {
    // Don't run on first render or login page
    if (skipWalletOps || !isAuthenticated) return;
    
    // Add a small delay to allow the page to settle
    const timer = setTimeout(() => {
      // If wallet is not loaded yet and we've navigated to a page
      if (!wallet && !isLoading && walletError) {
        console.log('Navigation detected, retrying wallet connection');
        retryWalletFetch();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [location.pathname, wallet, isLoading, isAuthenticated, skipWalletOps, walletError]);

  // Enhanced effect to attempt auto-retry after initial authentication
  useEffect(() => {
    // Skip if not authenticated or on login page
    if (!isAuthenticated || skipWalletOps) return;
    
    // Only run this once per session
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      
      // Delay the fetch slightly to ensure auth is fully processed
      const timer = setTimeout(async () => {
        console.log('Attempting initial wallet fetch after authentication');
        
        // Skip if post-login fetch was already attempted
        if (!postLoginFetchAttemptedRef.current) {
          await fetchWalletInfo();
        
          // If wallet fetch was successful, also fetch transactions
          if (wallet) {
            fetchTransactions();
          }
        } else {
          console.log('Skipping duplicate wallet fetch, already attempted after login');
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, skipWalletOps, fetchWalletInfo, wallet, fetchTransactions]);

  const fetchTransactionsWrapper = async (): Promise<void> => {
    // Skip on login page
    if (skipWalletOps) return;
    
    // Check if enough time has passed since the last transaction fetch
    const currentTime = Date.now();
    const timeSinceLastFetch = currentTime - lastTransactionFetchTimeRef.current;
    
    if (timeSinceLastFetch < MIN_TRANSACTION_FETCH_INTERVAL) {
      console.log(`Skipping transactions fetch - only ${timeSinceLastFetch/1000}s since last fetch (limit: 25s)`);
      return;
    }
    
    lastTransactionFetchTimeRef.current = currentTime;
    console.log('Fetching transactions via wrapper');
    
    const txList = await fetchTransactions();
    
    // Also sync transaction history with our custom table
    if (wallet && txList && txList.length > 0) {
      await syncTransactionHistory(wallet.address, fetchNewTransactions);
    }
  };

  const retryWalletFetch = async (): Promise<void> => {
    // Skip on login page
    if (skipWalletOps) return;
    
    try {
      toast.info("Reconnecting to wallet...");
      const walletData = await fetchWalletInfo();
      
      if (wallet && walletData) {
        // Track balance change if any
        if (lastKnownBalanceRef.current !== null && balance !== lastKnownBalanceRef.current && isAuthenticated) {
          await logBalanceChange(
            { address: wallet.address, balance },
            lastKnownBalanceRef.current,
            'retry_connection'
          );
          lastKnownBalanceRef.current = balance;
        }
        
        toast.success("Wallet connected successfully!");
        
        // Also sync transaction history if enough time has passed
        const currentTime = Date.now();
        const timeSinceLastFetch = currentTime - lastTransactionFetchTimeRef.current;
        
        if (timeSinceLastFetch >= MIN_TRANSACTION_FETCH_INTERVAL) {
          lastTransactionFetchTimeRef.current = currentTime;
          await syncTransactionHistory(wallet.address, fetchNewTransactions);
        } else {
          console.log(`Skipping transaction sync after retry - only ${timeSinceLastFetch/1000}s since last fetch (limit: 25s)`);
        }
      }
    } catch (error) {
      console.error('Error retrying wallet connection:', error);
      toast.error("Failed to connect wallet. Please try again later.");
    }
  };

  return (
    <WalletContext.Provider 
      value={{ 
        wallet, 
        balance, 
        transactions, 
        isLoading: skipWalletOps ? false : isLoading, 
        walletError: skipWalletOps ? null : walletError,
        fetchTransactions: fetchTransactionsWrapper,
        sendTransaction: handleSendTransaction,
        retryWalletFetch
      }}
    >
      {children}
      {mnemonic && showMnemonicDialog && (
        <MnemonicDialog 
          mnemonic={mnemonic} 
          isOpen={showMnemonicDialog} 
          onClose={handleCloseMnemonicDialog} 
        />
      )}
    </WalletContext.Provider>
  );
};


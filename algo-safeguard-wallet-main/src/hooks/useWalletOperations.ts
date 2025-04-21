
import { useWalletInfo } from './wallet-info';
import { useTransactions } from './useTransactions';
import { useMnemonicHandling } from './useMnemonicHandling';
import { useEffect, useRef } from 'react';
import { logBalanceChange } from '@/lib/balance-tracking';
import { syncTransactionHistory } from '@/lib/transaction-logging';
import { useLocation } from 'react-router-dom';

export const useWalletOperations = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/index';
  const lastWalletEventTime = useRef<number>(0);
  
  const walletInfo = useWalletInfo();
  const transactions = useTransactions(walletInfo.wallet, walletInfo.fetchWalletInfo);
  const mnemonicHandling = useMnemonicHandling();

  // Handle mnemonic from localStorage if present
  useEffect(() => {
    if (walletInfo.wallet && !mnemonicHandling.mnemonic) {
      const registrationMnemonic = localStorage.getItem('registration_mnemonic');
      const mnemonicConfirmed = localStorage.getItem('mnemonic_confirmed');
      const walletCreationConfirmed = localStorage.getItem('wallet_creation_confirmed');
      
      // Only process mnemonic if it hasn't been confirmed yet
      if (registrationMnemonic && mnemonicConfirmed !== 'true' && walletCreationConfirmed !== 'true') {
        console.log('Found registration mnemonic in localStorage, handling it');
        mnemonicHandling.handleMnemonicReceived(registrationMnemonic);
        // Don't clear from localStorage here - we'll clear it after the user confirms
        // This ensures the mnemonic is available if they refresh the page
      }
    }
  }, [walletInfo.wallet, mnemonicHandling.mnemonic, mnemonicHandling.handleMnemonicReceived]);

  // Listen for wallet-fetch-needed event to prioritize wallet fetching
  useEffect(() => {
    // Skip if on login page
    if (isLoginPage) return;
    
    const handleWalletFetchEvent = (event: Event) => {
      // Store the time of the event
      lastWalletEventTime.current = Date.now();
      
      // Schedule an immediate wallet fetch with a minimal delay
      setTimeout(() => {
        console.log('Executing wallet fetch from event handler');
        refreshWallet();
      }, 300);
    };
    
    window.addEventListener('wallet-fetch-needed', handleWalletFetchEvent);
    window.addEventListener('wallet-refresh-needed', handleWalletFetchEvent);
    
    return () => {
      window.removeEventListener('wallet-fetch-needed', handleWalletFetchEvent);
      window.removeEventListener('wallet-refresh-needed', handleWalletFetchEvent);
    };
  }, [isLoginPage]);

  // Enhanced refresh function that updates both wallet and transactions
  const refreshWallet = async () => {
    // Skip if on login page
    if (isLoginPage) {
      console.log('Skipping wallet refresh on login page');
      return null;
    }
    
    // Store current balance for change tracking
    const previousBalance = walletInfo.wallet?.balance || 0;
    
    // Fetch wallet info to update balance
    console.log('Performing wallet refresh...');
    const walletData = await walletInfo.fetchWalletInfo();
    
    // If wallet data was fetched successfully
    if (walletData) {
      console.log('Wallet refresh successful, address:', walletData.address);
      
      // Log balance change if there is one
      if (walletData.balance !== previousBalance && walletInfo.wallet) {
        await logBalanceChange(
          { address: walletInfo.wallet.address, balance: walletData.balance },
          previousBalance,
          'manual_refresh'
        );
      }
      
      // Sync transaction history
      if (walletInfo.wallet?.address) {
        await syncTransactionHistory(
          walletInfo.wallet.address,
          transactions.fetchNewTransactions
        );
      }
      
      // Also fetch latest transactions through the standard method
      await transactions.fetchTransactions();
    } else {
      console.log('Wallet refresh did not return wallet data');
    }
    
    return walletData;
  };

  return {
    // Spread all properties from the individual hooks
    ...walletInfo,
    ...transactions,
    ...mnemonicHandling,
    // Add the new refreshWallet function
    refreshWallet,
    // Add the login page flag for other components to use
    isLoginPage,
  };
};


import { useEffect, useRef } from 'react';
import { Transaction, WalletInfo } from '@/lib/api';
import { logTransactions } from '@/lib/transaction-logging';

export const useTransactionHistory = (
  isAuthenticated: boolean,
  wallet: WalletInfo | null,
  fetchTransactions: () => Promise<Transaction[]>,
  fetchNewTransactions: (lastTimestamp?: string) => Promise<Transaction[]>
) => {
  const lastTransactionTimestampRef = useRef<string | undefined>(undefined);

  // Load initial transaction history on startup
  useEffect(() => {
    if (isAuthenticated && wallet) {
      fetchTransactions().then(txList => {
        if (txList && txList.length > 0) {
          const sortedTransactions = [...txList].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          if (sortedTransactions.length > 0) {
            lastTransactionTimestampRef.current = sortedTransactions[0].timestamp;
          }
          
          // Sync transaction history - using only the transactions table
          // Only attempt to log if we have an active session
          if (wallet.address) {
            logTransactions(txList, wallet.address).catch(err => {
              console.log('Transaction logging error (will retry later):', err);
            });
          }
        }
      });
    } else {
      lastTransactionTimestampRef.current = undefined;
    }
  }, [isAuthenticated, wallet, fetchTransactions]);

  return {
    lastTransactionTimestampRef
  };
};

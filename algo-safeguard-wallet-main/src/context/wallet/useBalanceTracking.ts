
import { useEffect, useRef } from 'react';
import { WalletInfo } from '@/lib/api';
import { logBalanceChange } from '@/lib/balance-tracking';
import { useAuth } from '@/context/AuthContext';

interface BalanceTrackingProps {
  wallet: WalletInfo | null;
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
  onNewTransactions: () => void;
}

export const useBalanceTracking = ({
  wallet,
  balance,
  onBalanceUpdate,
  onNewTransactions
}: BalanceTrackingProps) => {
  const lastBalanceRef = useRef<number | null>(null);
  const { isAuthenticated } = useAuth();

  // Set up initial balance tracking
  useEffect(() => {
    if (isAuthenticated && wallet && balance !== undefined) {
      // If this is the first balance we're tracking, or a wallet address change
      if (lastBalanceRef.current === null) {
        lastBalanceRef.current = balance;
      }
      // If balance changed from previous value
      else if (balance !== lastBalanceRef.current) {
        // Log the balance change
        const previousBalance = lastBalanceRef.current;
        lastBalanceRef.current = balance;
        
        logBalanceChange(
          { address: wallet.address, balance },
          previousBalance,
          'init_update'
        ).catch(err => console.error('Error logging balance change:', err));
        
        // Notify about balance update
        onBalanceUpdate(balance);
        
        // Check for new transactions
        onNewTransactions();
      }
    }
  }, [isAuthenticated, wallet, balance, onBalanceUpdate, onNewTransactions]);

  return {
    lastBalanceRef
  };
};

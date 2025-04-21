
import { useEffect, useRef, useState } from 'react';
import { getLastRecordedBalance, logBalanceChange } from '@/lib/balance-tracking';
import { WalletInfo } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

interface BalanceTrackingProps {
  isAuthenticated: boolean;
  wallet: WalletInfo | null;
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
  onNewTransactions: () => void;
}

export const useBalanceTracking = ({
  isAuthenticated,
  wallet,
  balance,
  onBalanceUpdate,
  onNewTransactions
}: BalanceTrackingProps) => {
  const lastKnownBalanceRef = useRef<number>(balance);
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);
  const walletAddressRef = useRef<string | null>(null);
  const { isAuthenticated: authState } = useAuth();

  // Initialize last known balance from database logs
  useEffect(() => {
    const initLastKnownBalance = async () => {
      if (wallet?.address && isAuthenticated) {
        walletAddressRef.current = wallet.address;
        lastKnownBalanceRef.current = balance;
        
        const lastRecorded = await getLastRecordedBalance(wallet.address);
        if (lastRecorded !== null) {
          setPreviousBalance(lastRecorded);
        } else {
          setPreviousBalance(balance);
        }
      }
    };

    if (isAuthenticated && wallet && previousBalance === null) {
      initLastKnownBalance();
    }
  }, [isAuthenticated, wallet, balance, previousBalance]);

  // Handle balance changes when balance prop changes
  useEffect(() => {
    const handleBalanceChange = async () => {
      if (!wallet || previousBalance === null || balance === previousBalance || !isAuthenticated) {
        return;
      }
      
      try {
        // Log the balance change
        await logBalanceChange(
          { address: wallet.address, balance }, 
          previousBalance,
          'polling_update'
        );
        
        // Update stored balance
        setPreviousBalance(balance);
        lastKnownBalanceRef.current = balance;
        
        // Trigger additional actions on balance change
        onBalanceUpdate(balance);
        onNewTransactions();
      } catch (error) {
        console.error("Error handling balance change:", error);
      }
    };

    if (isAuthenticated && wallet && previousBalance !== null) {
      handleBalanceChange();
    }
  }, [isAuthenticated, wallet, balance, previousBalance, onBalanceUpdate, onNewTransactions]);

  return {
    lastKnownBalanceRef,
    previousBalance
  };
};

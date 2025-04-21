
import { useRef } from 'react';
import { WalletInfo, Transaction } from '@/lib/types';
import { useUserActivity } from './useUserActivity';
import { useActivityCheck } from './wallet/useActivityCheck';
import { useTransactionSync } from './wallet/useTransactionSync';
import { useBalanceTracking } from './wallet/useBalanceTracking';
import { useConfirmationUpdates } from './wallet/useConfirmationUpdates';
import { useWebsocketSetup } from './wallet/useWebsocketSetup';

export const useWalletWebsocket = (
  isAuthenticated: boolean,
  wallet: WalletInfo | null,
  balance: number,
  onBalanceUpdate: (newBalance: number) => void,
  onNewTransactions: () => void,
  fetchTransactions: () => Promise<any>,
  fetchNewTransactions: (lastTimestamp?: string) => Promise<Transaction[]>
) => {
  const { isActive, hasNewActivity, resetNewActivity } = useUserActivity();
  
  // Activity check hook
  const { 
    lastBalanceCheckTimeRef,
    lastTransactionFetchTimeRef,
    MIN_TRANSACTION_FETCH_INTERVAL
  } = useActivityCheck({
    isAuthenticated,
    wallet,
    hasNewActivity,
    resetNewActivity,
    fetchNewTransactions
  });
  
  // Balance tracking hook
  const { 
    lastKnownBalanceRef,
    previousBalance
  } = useBalanceTracking({
    isAuthenticated,
    wallet,
    balance,
    onBalanceUpdate,
    onNewTransactions
  });
  
  // Transaction sync hook
  useTransactionSync({
    isAuthenticated,
    wallet,
    isActive,
    fetchNewTransactions,
    lastTransactionFetchTimeRef,
    MIN_TRANSACTION_FETCH_INTERVAL
  });
  
  // Websocket setup hook
  useWebsocketSetup({
    isAuthenticated,
    wallet,
    lastKnownBalanceRef,
    onBalanceUpdate,
    onNewTransactions
  });
  
  // Confirmation updates hook
  useConfirmationUpdates({
    isAuthenticated,
    fetchTransactions,
    lastTransactionFetchTimeRef,
    MIN_TRANSACTION_FETCH_INTERVAL
  });
};

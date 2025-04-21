
import { useEffect } from 'react';
import { setupBalanceWebsocket } from '@/lib/wallet-api';
import { WalletInfo } from '@/lib/types';

interface WebsocketSetupProps {
  isAuthenticated: boolean;
  wallet: WalletInfo | null;
  lastKnownBalanceRef: React.RefObject<number>;
  onBalanceUpdate: (newBalance: number) => void;
  onNewTransactions: () => void;
}

export const useWebsocketSetup = ({
  isAuthenticated,
  wallet,
  lastKnownBalanceRef,
  onBalanceUpdate,
  onNewTransactions
}: WebsocketSetupProps) => {
  // Setup websocket/polling for real-time balance updates
  useEffect(() => {
    if (!isAuthenticated || !wallet) return;
    
    let isMounted = true;

    const handleBalanceUpdate = (newBalance: number) => {
      // Only process if balance actually changed and component is still mounted
      if (isMounted && newBalance !== lastKnownBalanceRef.current) {
        // Log balance change will happen in the effect that monitors balance
        onBalanceUpdate(newBalance);
      }
    };

    const cleanup = setupBalanceWebsocket(handleBalanceUpdate, onNewTransactions);
    
    return () => {
      isMounted = false;
      cleanup();
    };
  }, [isAuthenticated, wallet, onBalanceUpdate, onNewTransactions, lastKnownBalanceRef]);
};

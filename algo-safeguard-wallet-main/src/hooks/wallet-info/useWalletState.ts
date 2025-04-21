
import { useState } from 'react';
import { WalletInfo } from '@/lib/types';

export const useWalletState = () => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  return {
    wallet,
    setWallet,
    balance,
    setBalance,
    isLoading,
    setIsLoading,
    walletError,
    setWalletError
  };
};

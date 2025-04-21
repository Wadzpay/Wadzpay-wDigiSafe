
import { Transaction, WalletInfo } from '@/lib/api';

export interface WalletContextType {
  wallet: WalletInfo | null;
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  walletError: string | null;
  fetchTransactions: () => Promise<void>;
  sendTransaction: (to: string, amount: number, note?: string) => Promise<Transaction>;
  retryWalletFetch: () => Promise<void>;
}

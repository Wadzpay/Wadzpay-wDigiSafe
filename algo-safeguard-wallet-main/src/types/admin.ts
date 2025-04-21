
export interface CustomerSummary {
  id: string;
  customerId: string;
  walletAddress: string;
  balance: number;
  transactionCount: number;
  totalDeposits: number;
  depositAmount: number;
  totalWithdrawals: number;
  withdrawalAmount: number;
}

export interface DashboardStats {
  totalWallets: number;
  totalTransactions: number;
  totalDepositsCount: number;
  totalDepositsAmount: number;
  totalWithdrawalsCount: number;
  totalWithdrawalsAmount: number;
}

export interface WalletData {
  id: string;
  address: string;
  private_key: string;
  created_at: string;
  customer_id?: string;
}

export interface TransactionData {
  id: string;
  wallet_address: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  note: string;
  type: string;
  tx_hash: string;
  timestamp: string;
  confirmations: number;
  customer_id?: string;
}

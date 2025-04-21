
// Common interfaces shared across API modules

export interface Transaction {
  id: string;
  txHash: string;
  type: 'send' | 'receive';
  amount: number;
  from: string;
  to: string;
  timestamp: string;
  confirmations: number;
  fee: number;
  note?: string;
}

export interface WalletInfo {
  address: string;
  balance: number;
}

export interface CustomerInfo {
  id: string;
  customerId: string;
}

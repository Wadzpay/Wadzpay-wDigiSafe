
// This file re-exports all API functionality from modular files
// This allows existing code to continue importing from '@/lib/api' without changes

// Export from authentication module
export { authenticateUser, registerCustomer } from './auth-api';

// Export from wallet module
export { getWalletInfo, setupBalanceWebsocket } from './wallet-api';

// Export from transaction module
export { 
  getTransactions, 
  getNewTransactions, 
  sendTransaction, 
  updateTransactionConfirmations 
} from './transactions';

// Export types
export type { Transaction, WalletInfo, CustomerInfo } from './types';

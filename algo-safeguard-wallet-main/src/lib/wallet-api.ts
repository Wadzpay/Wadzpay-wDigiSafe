
// Wallet API functionality
// Export all wallet related functionality from individual modules

export { getWalletInfo } from './wallet/fetch-wallet-info'; // Updated to import from new module
export { setupBalanceWebsocket } from './wallet-balance';
export { clearWalletData } from './wallet-cleanup';
export { 
  getTransactions, 
  getNewTransactions, 
  sendTransaction, 
  updateTransactionConfirmations 
} from './transactions';

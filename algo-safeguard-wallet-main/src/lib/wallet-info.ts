// This file now re-exports all wallet functionality from the new modular structure
// Keeping this file maintains backward compatibility with existing imports

// Re-export the main wallet info function and all utility functions
export { getWalletInfo } from './wallet/fetch-wallet-info';
export { getQueryUserId, fetchWalletData, fetchWalletBalance } from './wallet';

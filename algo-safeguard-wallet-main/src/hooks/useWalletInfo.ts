
// This file re-exports the modular wallet-info hook for backward compatibility
import { useWalletInfo } from './wallet-info';
export { useWalletInfo };

// Export all supporting hooks for possible direct usage
export * from './wallet-info';

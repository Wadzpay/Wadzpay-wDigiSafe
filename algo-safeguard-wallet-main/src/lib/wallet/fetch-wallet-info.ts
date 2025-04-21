
import { supabase } from "@/integrations/supabase/client";
import { WalletInfo } from "../types";
import { getQueryUserId } from "./user-id-resolver";
import { fetchWalletData } from "./wallet-data-fetcher";
import { fetchWalletBalance } from "./balance-fetcher";

interface WalletCreationResponse {
  walletInfo: WalletInfo;
  mnemonic?: string;
}

interface GetWalletInfoOptions {
  skipAuthCheck?: boolean;
  maxRetries?: number;
}

/**
 * Get wallet information with comprehensive error handling and fallbacks
 * Returns wallet information and optional mnemonic if available
 */
export const getWalletInfo = async (options?: GetWalletInfoOptions): Promise<WalletCreationResponse> => {
  const skipAuthCheck = options?.skipAuthCheck || false;
  const maxRetries = options?.maxRetries || 1;
  let currentRetry = 0;
  
  // Check if we're authenticated with our custom token or Supabase
  const isCustomAuthenticated = !!localStorage.getItem('auth_token');
  
  if (!isCustomAuthenticated && !skipAuthCheck) {
    console.log('Not authenticated with custom auth, cannot fetch wallet info');
    throw new Error('Not authenticated');
  }

  // Allow multiple retries for wallet fetching
  const tryFetchWallet = async (): Promise<WalletCreationResponse> => {
    try {
      console.log(`Attempt ${currentRetry + 1}/${maxRetries}: Checking if customer has a wallet...`);
      
      // Resolve user ID using the comprehensive resolver function
      const queryUserId = await getQueryUserId();
      
      if (!queryUserId) {
        // Still no valid user ID found
        console.error('No valid user ID available after all attempts');
        throw new Error('No user ID available. Please log in again.');
      }
      
      console.log('Using user ID for wallet query:', queryUserId);
      
      // Fetch wallet data using the user ID
      const walletData = await fetchWalletData(queryUserId);

      if (!walletData) {
        console.log(`No wallet found for user ${queryUserId} in database`);
        
        // Check if there's a temporary address
        const tempAddress = localStorage.getItem('temp_wallet_address');
        const mnemonic = localStorage.getItem('registration_mnemonic');
        
        if (tempAddress && mnemonic) {
          console.log('Using temporary wallet address as fallback:', tempAddress);
          
          // Return a temporary wallet object with just the address
          return {
            walletInfo: {
              address: tempAddress,
              balance: 0
            },
            mnemonic
          };
        }
        
        throw new Error(`No wallet found for user ID: ${queryUserId} in database.`);
      }

      console.log('Wallet found, fetching balance for address:', walletData.address);
      
      try {
        // Get the current balance
        const walletInfo = await fetchWalletBalance(walletData.address);
        const mnemonic = localStorage.getItem('registration_mnemonic');
        
        return {
          walletInfo,
          mnemonic: mnemonic || undefined,
        };
      } catch (balanceError) {
        console.error('Error fetching balance:', balanceError);
        // Return wallet with zero balance instead of throwing an error
        const mnemonic = localStorage.getItem('registration_mnemonic');
        
        return {
          walletInfo: {
            address: walletData.address,
            balance: 0,
          },
          mnemonic: mnemonic || undefined,
        };
      }
    } catch (error) {
      // If we have retries left, try again
      if (currentRetry < maxRetries - 1) {
        currentRetry++;
        console.log(`Wallet fetch attempt ${currentRetry} failed, retrying...`);
        // Exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(1.5, currentRetry), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return tryFetchWallet();
      }
      
      console.error('Error in getWalletInfo after all retries:', error);
      throw error; // Propagate the original error for better debugging
    }
  };
  
  return tryFetchWallet();
};


import { useState, useCallback } from 'react';
import { getWalletInfo } from '@/lib/wallet-api';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

export const useFetchOperation = () => {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [loadingRetries, setLoadingRetries] = useState<number>(0);
  
  // Check if we're on a page that should suppress error messages
  const isMnemonicPage = typeof window !== 'undefined' && window.location.pathname.includes('/mnemonic');

  const prepareFetchingEnvironment = async () => {
    // First, get the session to check for user ID
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    // Important: Make sure we have a valid user ID before proceeding
    if (userId) {
      console.log('Found user ID from session:', userId);
      localStorage.setItem('user_id', userId);
    } else {
      console.log('No session user ID, using local storage user ID');
      
      // Additional fallback: try to get user ID from localStorage or customer ID
      const storedUserId = localStorage.getItem('user_id');
      const customerId = localStorage.getItem('customer_id');
      
      if (!storedUserId && customerId) {
        // Try to get user ID from customers table using customer ID
        try {
          console.log('Trying to retrieve user ID using customer ID:', customerId);
          const { data, error } = await supabase
            .from('customers')
            .select('id')
            .eq('customer_id', customerId)
            .maybeSingle();
            
          if (data && data.id) {
            console.log('Found user ID from customers table:', data.id);
            localStorage.setItem('user_id', data.id);
          } else if (error) {
            console.error('Error retrieving user ID from customers:', error);
          }
        } catch (err) {
          console.error('Failed to retrieve user ID from customers:', err);
        }
      }
    }
  };

  const handleFetchError = (error: any, fetchWalletInfo: Function) => {
    console.error('Error fetching wallet info:', error);
    
    // Extract the specific error message if available
    let errorMessage = 'Failed to load wallet information';
    let walletError = 'unknown-error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('No wallet found')) {
        walletError = 'wallet-not-found';
      } else if (error.message.includes('Not authenticated')) {
        walletError = 'not-authenticated';
      } else if (error.message.includes('No user ID available')) {
        walletError = 'no-user-id';
        
        // Clear auth token to force re-login
        localStorage.removeItem('auth_token');
      }
    }
    
    // Check for stored registration timestamp
    const registrationTimestamp = localStorage.getItem('registration_timestamp');
    const isNewRegistration = registrationTimestamp && 
      (Date.now() - parseInt(registrationTimestamp)) < 60000; // 60 seconds window
    
    return { errorMessage, walletError, isNewRegistration };
  };

  const retryFetch = (fetchWalletInfo: Function, currentRetries: number, delay: number = 3000) => {
    setLoadingRetries(prev => prev + 1);
    console.log(`Retrying wallet fetch (attempt ${currentRetries + 1}), waiting ${delay/1000}s...`);
    
    // Wait and try again with the specified delay
    setTimeout(() => {
      setIsFetching(false); // Reset fetching flag before retrying
      fetchWalletInfo();
    }, delay);
  };
  
  return {
    isFetching,
    setIsFetching,
    loadingRetries,
    setLoadingRetries,
    isMnemonicPage,
    prepareFetchingEnvironment,
    handleFetchError,
    retryFetch
  };
};

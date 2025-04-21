
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

export const useWalletCreation = (mnemonic: string | null, confirmed: boolean) => {
  const navigate = useNavigate();
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(false);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 20;
  const tempWalletAddress = localStorage.getItem('temp_wallet_address');

  const checkWalletCreation = async () => {
    if (isCheckingWallet || isWalletReady) return;
    
    setIsCheckingWallet(true);
    setProgress(10);
    
    try {
      console.log('Checking if wallet has been created...');
      
      // First check if we have a registration timestamp to identify new registrations
      const registrationTimestamp = localStorage.getItem('registration_timestamp');
      if (!registrationTimestamp) {
        throw new Error('Missing registration timestamp');
      }
      
      // Calculate how much time has passed since registration
      const elapsed = Date.now() - parseInt(registrationTimestamp);
      console.log(`Time since registration: ${elapsed}ms`);
      
      // Directly query the wallets table to check if the wallet has been created
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('address')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking wallet:', error);
        throw new Error('Failed to check wallet status');
      }
      
      // If we have a wallet address from the database or from localStorage
      if ((wallet && wallet.address) || tempWalletAddress) {
        const walletAddress = wallet?.address || tempWalletAddress;
        console.log('Wallet successfully created:', walletAddress);
        setIsWalletReady(true);
        setProgress(100);
        toast.success('Wallet has been successfully created!');
        
        // Clean up localStorage once confirmed wallet is ready
        localStorage.removeItem('registration_mnemonic');
        localStorage.setItem('wallet_creation_confirmed', 'true');
        
        // Delay navigation to allow toast to be seen
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        
        return;
      } else {
        // If more than 2 minutes have passed since registration, we're probably stuck
        if (elapsed > 120000 && attempts > 10) {
          throw new Error('Wallet creation is taking too long');
        }
        
        throw new Error('Wallet not ready yet');
      }
    } catch (error) {
      console.log('Wallet not ready yet, will retry...', error);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      // Update progress based on attempt count
      const newProgress = Math.min(90, 10 + (newAttempts * 80 / maxAttempts));
      setProgress(newProgress);
      
      // Retry if we haven't reached max attempts, with increasing delay
      if (newAttempts < maxAttempts) {
        const delay = 2000 + (newAttempts * 500); // Increasing delay
        console.log(`Will retry in ${delay}ms (attempt ${newAttempts}/${maxAttempts})`);
        setTimeout(checkWalletCreation, delay);
      } else {
        setProgress(0);
        toast.error('Could not create wallet after several attempts. Please try again later.');
      }
    } finally {
      setIsCheckingWallet(false);
    }
  };

  // Start checking wallet creation when component mounts or confirmation changes
  useEffect(() => {
    if (confirmed) {
      checkWalletCreation();
    }
  }, [confirmed]);

  // Effect to clean up mnemonic when leaving the page
  useEffect(() => {
    return () => {
      // We'll only remove the mnemonic when the user confirms they've saved it
      // or when they navigate away from this page
      if (confirmed || isWalletReady) {
        localStorage.removeItem('registration_mnemonic');
      }
    };
  }, [confirmed, isWalletReady]);

  return {
    isWalletReady,
    isCheckingWallet,
    progress,
    attempts,
    checkWalletCreation
  };
};

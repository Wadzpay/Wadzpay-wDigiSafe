
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import MnemonicDisplay from '@/components/mnemonic/MnemonicDisplay';
import WalletCreationProgress from '@/components/mnemonic/WalletCreationProgress';
import ConfirmationButtons from '@/components/mnemonic/ConfirmationButtons';
import { useWalletCreation } from '@/hooks/useWalletCreation';
import { useWalletOperations } from '@/hooks/useWalletOperations';
import { toast } from 'sonner';

const MnemonicPage = () => {
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const tempWalletAddress = localStorage.getItem('temp_wallet_address');
  const { mnemonic: contextMnemonic } = useWalletOperations();
  
  // Check if wallet creation was previously confirmed
  useEffect(() => {
    const walletCreationConfirmed = localStorage.getItem('wallet_creation_confirmed');
    const mnemonicConfirmed = localStorage.getItem('mnemonic_confirmed');
    
    console.log('MnemonicPage mount - wallet creation confirmed:', walletCreationConfirmed);
    console.log('MnemonicPage mount - mnemonic confirmed:', mnemonicConfirmed);
    
    // Only redirect if wallet creation was explicitly confirmed
    if (walletCreationConfirmed === 'true' && mnemonicConfirmed === 'true') {
      console.log('Wallet creation was previously confirmed, redirecting to dashboard');
      toast.info('Recovery phrase was already confirmed');
      navigate('/dashboard');
    }
  }, [navigate]);

  // Get mnemonic from localStorage or context on mount
  useEffect(() => {
    const storedMnemonic = localStorage.getItem('registration_mnemonic');
    
    if (storedMnemonic) {
      console.log('Using mnemonic from localStorage');
      setMnemonic(storedMnemonic);
      return;
    }
    
    // If no mnemonic in localStorage but available in context, use that
    if (contextMnemonic) {
      console.log('Using mnemonic from context');
      setMnemonic(contextMnemonic);
      return;
    }
    
    // If no mnemonic is found at all, redirect to dashboard
    console.log('No mnemonic found, redirecting to dashboard');
    toast.error('No recovery phrase found');
    navigate('/dashboard');
  }, [navigate, contextMnemonic]);

  const {
    isWalletReady,
    isCheckingWallet,
    progress,
    attempts,
    checkWalletCreation
  } = useWalletCreation(mnemonic, confirmed);

  const handleConfirm = () => {
    console.log('User confirmed they have saved the mnemonic');
    setConfirmed(true);
    // Don't remove registration_mnemonic yet in case we need it for retries
    // But we will mark it as confirmed
    localStorage.setItem('mnemonic_confirmed', 'true');
    
    // Start checking for wallet creation
    checkWalletCreation();
  };

  if (!mnemonic) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <MnemonicDisplay mnemonic={mnemonic} />
        
        <CardContent>
          <WalletCreationProgress 
            isCheckingWallet={isCheckingWallet}
            confirmed={confirmed}
            progress={progress}
            attempts={attempts}
            tempWalletAddress={tempWalletAddress}
          />
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <ConfirmationButtons 
            mnemonic={mnemonic}
            confirmed={confirmed}
            isCheckingWallet={isCheckingWallet}
            onConfirm={handleConfirm}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default MnemonicPage;


import React from 'react';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '@/components/LoadingSpinner';

interface WalletCreationProgressProps {
  isCheckingWallet: boolean;
  confirmed: boolean;
  progress: number;
  attempts: number;
  tempWalletAddress: string | null;
}

const WalletCreationProgress: React.FC<WalletCreationProgressProps> = ({
  isCheckingWallet,
  confirmed,
  progress,
  attempts,
  tempWalletAddress
}) => {
  if (!isCheckingWallet && !confirmed) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-sm text-muted-foreground mb-2">
        {tempWalletAddress ? 
          `Creating wallet ${tempWalletAddress.substring(0, 8)}...${tempWalletAddress.substring(tempWalletAddress.length - 4)}` : 
          'Creating your wallet...'}
      </p>
      <Progress value={progress} className="h-2" />
      {attempts > 10 && (
        <p className="text-xs text-muted-foreground mt-2">
          This is taking longer than expected. Please be patient...
        </p>
      )}
    </div>
  );
};

export default WalletCreationProgress;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ConfirmationButtonsProps {
  mnemonic: string;
  confirmed: boolean;
  isCheckingWallet: boolean;
  onConfirm: () => void;
}

const ConfirmationButtons: React.FC<ConfirmationButtonsProps> = ({
  mnemonic,
  confirmed,
  isCheckingWallet,
  onConfirm
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      toast.success('Mnemonic phrase copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button 
        variant="outline" 
        className="w-full sm:w-auto" 
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
        {copied ? 'Copied' : 'Copy to Clipboard'}
      </Button>
      <Button 
        className="w-full sm:w-auto"
        onClick={onConfirm}
        disabled={confirmed || isCheckingWallet}
      >
        {isCheckingWallet ? (
          <>
            <LoadingSpinner className="mr-2" />
            Waiting for Wallet Creation
          </>
        ) : confirmed ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Saved
          </>
        ) : (
          'I Have Safely Stored My Recovery Phrase'
        )}
      </Button>
    </div>
  );
};

export default ConfirmationButtons;

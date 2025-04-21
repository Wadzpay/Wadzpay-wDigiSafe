
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@/context/WalletContext';
import { Asset } from '@/types/asset';

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

const DepositDialog = ({ open, onOpenChange, asset }: DepositDialogProps) => {
  const { wallet } = useWallet();
  const walletAddress = wallet?.address || '';
  const assetSymbol = asset?.symbol || '';

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Address copied to clipboard');
    }
  };

  if (!asset) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fullHeight className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Deposit {assetSymbol}</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 rounded-full hover:bg-slate-100" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <NetworkSelector network="Testnet" assetSymbol={assetSymbol} />
          <DepositAddressSection walletAddress={walletAddress} onCopy={copyToClipboard} />
          <DepositInstructions assetSymbol={assetSymbol} />
        </div>

        <DialogFooter className="flex justify-between items-center mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button variant="default" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            I made a deposit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface NetworkSelectorProps {
  network: string;
  assetSymbol: string;
}

const NetworkSelector = ({ network, assetSymbol }: NetworkSelectorProps) => {
  return (
    <div className="bg-muted rounded-md p-3">
      <div className="text-sm text-muted-foreground mb-2">
        Selected network <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full ml-1">{network}</span>
      </div>
      <div className="bg-white border rounded-md p-3 flex items-center gap-2">
        <div className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center text-blue-700">
          <svg viewBox="0 0 32 32" className="w-3 h-3" fill="currentColor">
            <path d="M22.5 23.5H18l-5.4-9h-2.2v3.5h3.5v5.5h-9v-5.5h2v-14h2v-4h5l5.4 9h2.2v-3.5h-3.5v-5.5h9v5.5h-2v14h-2z"/>
          </svg>
        </div>
        <div>Algorand ({network})</div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Use this network on the platform or wallet you're sending crypto from.
      </p>
    </div>
  );
};

interface DepositAddressSectionProps {
  walletAddress: string;
  onCopy: () => void;
}

const DepositAddressSection = ({ walletAddress, onCopy }: DepositAddressSectionProps) => {
  if (!walletAddress) {
    return <div className="p-4 text-center">No wallet address available</div>;
  }
  
  return (
    <div className="bg-muted rounded-md p-3">
      <div className="text-sm mb-2">Deposit address</div>
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-md">
          <div className="w-36 h-36 mx-auto">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${walletAddress}`} 
              alt="QR Code"
              className="w-full h-full"
            />
          </div>
        </div>
        <div className="flex w-full items-center space-x-2">
          <div className="bg-white border rounded p-2 text-xs text-center w-full font-mono break-all">
            {walletAddress}
          </div>
          <Button size="sm" variant="outline" onClick={onCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface DepositInstructionsProps {
  assetSymbol: string;
}

const DepositInstructions = ({ assetSymbol }: DepositInstructionsProps) => {
  return (
    <div className="space-y-3">
      <InstructionStep number={1}>
        Deposits are only permitted from verified addresses.
      </InstructionStep>
      <InstructionStep number={2}>
        Please ensure that only {assetSymbol} is sent to this address. Sending any other tokens or cryptocurrency will likely result in unrecoverable loss.
      </InstructionStep>
      <InstructionStep number={3}>
        To deposit {assetSymbol} to your account, send funds to the address listed on this page.
      </InstructionStep>
      <InstructionStep number={4}>
        4 confirmations are required before a deposit is considered final and will be available to trade or withdraw.
      </InstructionStep>
      <InstructionStep number={5}>
        Minimum deposit amount: {assetSymbol} 0.1. Any deposits less than the minimum will not be credited or refunded.
      </InstructionStep>
    </div>
  );
};

interface InstructionStepProps {
  number: number;
  children: React.ReactNode;
}

const InstructionStep = ({ number, children }: InstructionStepProps) => {
  return (
    <div className="flex items-start gap-2">
      <div className="bg-muted-foreground/20 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">
        {number}
      </div>
      <p className="text-sm">{children}</p>
    </div>
  );
};

export default DepositDialog;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Copy, AlertTriangle } from 'lucide-react';

interface MnemonicDialogProps {
  mnemonic: string;
  isOpen: boolean;
  onClose: () => void;
}

const MnemonicDialog: React.FC<MnemonicDialogProps> = ({ mnemonic, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onClose();
      setConfirmed(false);
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Save Your Mnemonic Phrase
          </DialogTitle>
          <DialogDescription>
            This is your wallet recovery phrase. Write it down and keep it in a safe place.
            We do not store this information. If you lose it, you will lose access to your wallet.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-muted rounded-md my-4">
          <p className="text-center font-mono text-sm break-all">{mnemonic}</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-800 text-sm">
          <p>
            <strong>Important:</strong> Never share your mnemonic phrase with anyone. 
            Anyone with this phrase can access and control your wallet.
          </p>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button 
            variant="outline" 
            className="sm:w-auto" 
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied' : 'Copy to Clipboard'}
          </Button>
          <Button 
            className="sm:w-auto" 
            onClick={handleConfirm}
          >
            {confirmed ? <Check className="h-4 w-4 mr-2" /> : null}
            {confirmed ? 'Saved' : 'I Have Saved My Phrase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MnemonicDialog;


import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader, Check, AlertTriangle } from 'lucide-react';

interface TransactionResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionStatus: 'loading' | 'success' | 'error' | null;
  transactionHash: string;
  errorMessage: string;
  onClose: () => void;
}

const TransactionResultDialog = ({
  open,
  onOpenChange,
  transactionStatus,
  transactionHash,
  errorMessage,
  onClose,
}: TransactionResultDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transactionStatus === 'loading' && 'Sending Transaction...'}
            {transactionStatus === 'success' && 'Transaction Sent'}
            {transactionStatus === 'error' && 'Transaction Failed'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          {transactionStatus === 'loading' && (
            <div className="flex flex-col items-center gap-3">
              <Loader className="h-8 w-8 animate-spin text-algorand-blue" />
              <p className="text-center text-sm text-muted-foreground">
                Processing your transaction...
              </p>
              {errorMessage && (
                <p className="text-center text-sm text-amber-500 mt-2">
                  {errorMessage}
                </p>
              )}
            </div>
          )}
          
          {transactionStatus === 'success' && (
            <div className="flex flex-col items-center gap-3">
              <Check className="h-8 w-8 text-green-500" />
              <p className="text-center font-medium">Transaction Successful!</p>
              <div className="mt-2 w-full">
                <p className="text-xs text-muted-foreground mb-1">Transaction Hash:</p>
                <div className="bg-muted p-2 rounded-md overflow-x-auto max-w-full">
                  <code className="text-xs break-all">{transactionHash}</code>
                </div>
              </div>
            </div>
          )}

          {transactionStatus === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <p className="text-center font-medium">Transaction Failed</p>
              <div className="mt-2 w-full">
                <p className="text-xs text-muted-foreground mb-1">Error details:</p>
                <div className="bg-muted p-2 rounded-md overflow-x-auto max-w-full text-red-500">
                  <p className="text-xs break-all">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>
            {transactionStatus === 'loading' ? 'Close' : 'Done'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionResultDialog;

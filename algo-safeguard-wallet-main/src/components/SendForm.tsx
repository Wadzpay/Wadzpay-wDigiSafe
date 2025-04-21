
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';
import { useWallet } from '@/context/WalletContext';
import { motion } from 'framer-motion';
import SendFormInputs from './send/SendFormInputs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { validateAlgorandAddress } from '@/utils/algorand';
import { Loader, Check, AlertTriangle, X } from 'lucide-react';

const SendForm = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHashDialogOpen, setTxHashDialogOpen] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<'loading' | 'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { balance, sendTransaction } = useWallet();

  // Clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!recipient.trim()) {
      toast.error('Please enter a recipient address');
      return;
    }

    if (!validateAlgorandAddress(recipient)) {
      toast.error('Invalid Algorand address format. Should be 58 characters starting with A');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parsedAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    setTransactionStatus('loading');
    setTxHashDialogOpen(true);
    
    // Set a timeout to show error message if transaction takes too long
    const timeout = setTimeout(() => {
      if (transactionStatus === 'loading') {
        setErrorMessage('Transaction is taking longer than expected. You can close this dialog and check your transaction history later, or continue waiting.');
      }
    }, 20000); // 20 seconds timeout
    
    setTimeoutId(timeout);
    
    try {
      const txResult = await sendTransaction(recipient, parsedAmount);
      // Clear timeout as transaction completed
      if (timeoutId) clearTimeout(timeoutId);
      
      setTransactionHash(txResult.txHash);
      setTransactionStatus('success');
      // Reset form
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('Transaction error:', error);
      // Clear timeout as transaction failed
      if (timeoutId) clearTimeout(timeoutId);
      
      setTransactionStatus('error');
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setTxHashDialogOpen(false);
    setTransactionStatus(null);
    setTransactionHash('');
    setErrorMessage('');
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Send ALGO</CardTitle>
          <CardDescription>
            Transfer ALGO to another Algorand address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <SendFormInputs
              recipient={recipient}
              setRecipient={setRecipient}
              amount={amount}
              setAmount={setAmount}
              balance={balance}
              loading={loading}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !recipient || !amount}
            >
              {loading ? <LoadingSpinner size="sm" light /> : 'Send ALGO'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaction Result Dialog */}
      <Dialog open={txHashDialogOpen} onOpenChange={setTxHashDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {transactionStatus === 'loading' && 'Sending Transaction...'}
              {transactionStatus === 'success' && 'Transaction Sent'}
              {transactionStatus === 'error' && 'Transaction Failed'}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 rounded-full hover:bg-slate-100" 
              onClick={closeDialog}
            >
              <X className="h-4 w-4" />
            </Button>
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
          
          <DialogFooter>
            <Button onClick={closeDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SendForm;

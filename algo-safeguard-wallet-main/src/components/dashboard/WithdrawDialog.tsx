
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useWallet } from '@/context/WalletContext';
import { Loader, Check, AlertTriangle, Info, ChevronRight, X } from 'lucide-react';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: { symbol: string; balance: number } | null;
}

const WithdrawDialog = ({ open, onOpenChange, asset }: WithdrawDialogProps) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
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

  const resetState = () => {
    setRecipient('');
    setAmount('');
    setComment('');
    setTransactionHash('');
    setTransactionStatus(null);
    setErrorMessage('');
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const validateAlgorandAddress = (address: string) => {
    // Algorand addresses are base32 encoded and should be 58 characters long starting with A
    return /^[A-Z2-7]{58}$/.test(address);
  };

  const handleMaxClick = () => {
    // Set max amount (leaving a small buffer for transaction fees)
    const maxAmount = Math.max(0, balance - 0.01);
    setAmount(maxAmount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    // Set a timeout to show error message if transaction takes too long
    const timeout = setTimeout(() => {
      if (transactionStatus === 'loading') {
        setErrorMessage('Transaction is taking longer than expected. You can close this dialog and check your transaction history later, or continue waiting.');
      }
    }, 20000); // 20 seconds timeout
    
    setTimeoutId(timeout);
    
    try {
      const txResult = await sendTransaction(recipient, parsedAmount, comment);
      // Clear timeout as transaction completed
      if (timeoutId) clearTimeout(timeoutId);
      
      setTransactionHash(txResult.txHash);
      setTransactionStatus('success');
      // Reset form
      setRecipient('');
      setAmount('');
      setComment('');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fullHeight className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Withdraw {asset?.symbol || 'ALGO'}
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 rounded-full hover:bg-slate-100" 
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {!transactionStatus ? (
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Selected network <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">New</span></Label>
              <Select defaultValue="algorand">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="algorand">Algorand</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Use this network on the platform or wallet you're receiving crypto to.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="amount">Amount ({asset?.symbol || 'ALGO'})</Label>
                <span className="text-sm">Available: {balance.toFixed(6)} {asset?.symbol || 'ALGO'}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleMaxClick}
                  className="w-16"
                >
                  Max
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                A withdrawal fee of 0.001 {asset?.symbol || 'ALGO'} applies.
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="recipient">Destination address</Label>
              <Input
                id="recipient"
                placeholder="Enter Algorand address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="comment">Comment <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Textarea
                id="comment"
                placeholder="Your message..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={loading}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {asset?.symbol || 'ALGO'} withdrawals are irreversible once sent.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Minimum withdrawal amount is 0.1 {asset?.symbol || 'ALGO'}, excluding the withdrawal fee.
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center mt-6 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleClose}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading || !amount || !recipient}
                className="min-w-[180px]"
              >
                {loading ? (
                  <LoadingSpinner size="sm" light />
                ) : (
                  <>
                    Withdraw {asset?.symbol || 'ALGO'} <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 space-y-6">
            {transactionStatus === 'loading' && (
              <div className="flex flex-col items-center gap-3">
                <Loader className="h-12 w-12 animate-spin text-algorand-blue" />
                <p className="text-center text-base font-medium mt-2">
                  Processing your withdrawal...
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Please wait while we process your transaction.
                </p>
                {errorMessage && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mt-2 w-full">
                    <p className="text-center text-sm text-amber-600">
                      {errorMessage}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {transactionStatus === 'success' && (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="bg-green-50 rounded-full p-3">
                  <Check className="h-10 w-10 text-green-500" />
                </div>
                <p className="text-center text-lg font-medium">Withdrawal Successful!</p>
                <p className="text-center text-sm text-muted-foreground">
                  Your transaction has been submitted to the blockchain.
                </p>
                <div className="mt-2 w-full">
                  <p className="text-sm font-medium mb-1">Transaction Hash:</p>
                  <div className="bg-muted p-3 rounded-md overflow-x-auto max-w-full">
                    <code className="text-xs break-all">{transactionHash}</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can track your transaction on the blockchain explorer once it's confirmed.
                  </p>
                </div>
              </div>
            )}

            {transactionStatus === 'error' && (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="bg-red-50 rounded-full p-3">
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
                <p className="text-center text-lg font-medium">Withdrawal Failed</p>
                <div className="mt-2 w-full">
                  <p className="text-sm font-medium mb-1">Error details:</p>
                  <div className="bg-red-50 border border-red-100 p-3 rounded-md overflow-x-auto max-w-full">
                    <p className="text-sm text-red-600 break-all">{errorMessage}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Please try again later or contact support if the issue persists.
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex justify-end pt-4 border-t w-full">
              <Button 
                onClick={handleClose}
                variant={transactionStatus === 'success' ? 'default' : 'outline'} 
                className="min-w-[100px]"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;

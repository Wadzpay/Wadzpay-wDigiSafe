
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, CheckCircle, XCircle, ExternalLink, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { Transaction } from '@/lib/api';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/context/WalletContext';
import { cn } from '@/lib/utils';

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ 
  transaction, 
  onClose 
}) => {
  const { wallet } = useWallet();
  const userWalletAddress = wallet?.address || '';
  const isReceive = transaction.to === userWalletAddress;
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const openInExplorer = () => {
    window.open(`https://testnet.algoexplorer.io/tx/${transaction.txHash}`, '_blank');
  };

  return (
    <Dialog open={!!transaction} onOpenChange={() => onClose()}>
      <DialogContent fullHeight className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge 
              variant={isReceive ? 'outline' : 'secondary'}
              className={cn(
                "flex items-center gap-1",
                isReceive ? "text-green-600 border-green-200 bg-green-50" : "text-slate-600"
              )}
            >
              {isReceive ? (
                <><ArrowDownLeft size={14} /> Receive</>
              ) : (
                <><ArrowUpRight size={14} /> Send</>
              )}
            </Badge>
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-muted">
              {transaction.confirmations >= 10 ? 'Confirmed' : 'Pending'}
            </span>
            <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
              Testnet
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 rounded-full hover:bg-slate-100" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {format(new Date(transaction.timestamp), 'PPpp')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-1 mt-1">
                {transaction.confirmations >= 10 ? (
                  <>
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="font-medium">Confirmed</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-amber-500" />
                    <span className="font-medium">Pending</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Confirmations</p>
              <p className="font-medium">{transaction.confirmations}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Amount</p>
            <p className="text-2xl font-semibold">
              {isReceive ? '+' : '-'}{transaction.amount.toFixed(8)} ALGO
            </p>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-sm font-medium mb-1">Transaction Hash</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground truncate w-60">
                {transaction.txHash}
              </p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => copyToClipboard(transaction.txHash, 'Transaction hash')}
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">
              {isReceive ? 'From' : 'To'}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground truncate w-60">
                {isReceive ? transaction.from : transaction.to}
              </p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => copyToClipboard(
                  isReceive ? transaction.from : transaction.to, 
                  'Address'
                )}
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>

          {transaction.note && (
            <div>
              <p className="text-sm font-medium mb-1">Note</p>
              <p className="text-sm p-2 bg-muted rounded-md">{transaction.note}</p>
            </div>
          )}
          
          {transaction.fee > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">Network Fee</p>
              <p className="text-sm">{transaction.fee.toFixed(8)} ALGO</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={openInExplorer}
            className="gap-1"
          >
            <ExternalLink size={14} />
            View in Testnet Explorer
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetail;

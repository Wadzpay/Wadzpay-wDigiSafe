
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import TransactionDetail from './TransactionDetail';
import { Transaction } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, isLoading }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const { wallet } = useWallet();
  const userWalletAddress = wallet?.address || '';

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(8);
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-pulse space-y-4 w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-md"/>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="bg-amber-50 px-4 py-1 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center">
            <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
              Testnet
            </Badge>
            <span className="text-xs text-amber-700 ml-2">All transactions are on Algorand Testnet</span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx, index) => {
              // Determine transaction type based on wallet address
              const isReceive = tx.to === userWalletAddress;
              const displayType = isReceive ? 'receive' : 'send';
              
              // Get the counterparty address (the other address in the transaction)
              const counterpartyAddress = isReceive ? tx.from : tx.to;
              
              return (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <TableCell>
                    <Badge 
                      variant={isReceive ? 'outline' : 'secondary'}
                      className={cn(
                        "flex items-center gap-1 w-fit",
                        isReceive ? "text-green-600 border-green-200 bg-green-50" : "text-slate-600"
                      )}
                    >
                      {isReceive ? (
                        <><ArrowDownLeft size={14} /> Receive</>
                      ) : (
                        <><ArrowUpRight size={14} /> Send</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {isReceive ? 'From: ' : 'To: '}
                    </span>
                    <span>
                      {truncateAddress(counterpartyAddress)}
                    </span>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    isReceive ? "text-green-600" : "text-slate-700"
                  )}>
                    {isReceive ? '+' : '-'}{formatAmount(tx.amount)} ALGO
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs"
                      onClick={() => setSelectedTx(tx)}
                    >
                      View
                    </Button>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {selectedTx && (
        <TransactionDetail 
          transaction={selectedTx} 
          onClose={() => setSelectedTx(null)} 
        />
      )}
    </>
  );
};

export default TransactionTable;

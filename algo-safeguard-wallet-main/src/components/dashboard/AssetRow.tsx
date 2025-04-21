
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/utils/formatCurrency';
import { Asset } from '@/types/asset';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import WithdrawDialog from './WithdrawDialog';

interface AssetRowProps {
  asset: Asset;
  inrValue: number | null;
  onDepositClick: (symbol: string) => void;
  onWithdrawClick: (symbol: string) => void;
  isMobile?: boolean;
}

const AssetRow = ({ 
  asset, 
  inrValue, 
  onDepositClick, 
  onWithdrawClick,
  isMobile = false 
}: AssetRowProps) => {
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const handleDepositClick = () => {
    onDepositClick(asset.symbol);
  };

  const handleWithdrawClick = () => {
    // For ALGO, open the withdraw dialog
    if (asset.symbol === 'ALGO') {
      setWithdrawDialogOpen(true);
    } else {
      // For other assets, use the original handler
      onWithdrawClick(asset.symbol);
    }
  };

  const formatBalance = (balance: number) => {
    // Format with 8 decimal places for small balances
    return balance < 0.0001 ? balance.toFixed(8) : balance.toFixed(4);
  };

  // Only enable withdraw for Algorand
  const canWithdraw = asset.symbol === 'ALGO';

  return (
    <>
      <TableRow>
        {/* Asset */}
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {asset.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{asset.name}</span>
              <span className="text-xs text-muted-foreground">{asset.symbol}</span>
            </div>
          </div>
        </TableCell>
        
        {/* Available */}
        <TableCell className="text-right">
          <div className="flex flex-col items-end">
            <span className={`text-sm ${isMobile ? 'font-semibold' : ''}`}>
              {formatBalance(asset.balance)} {asset.symbol}
            </span>
          </div>
        </TableCell>
        
        {/* Total - Hidden on mobile */}
        {!isMobile && (
          <TableCell className="text-right">
            {formatBalance(asset.balance)} {asset.symbol}
          </TableCell>
        )}
        
        {/* Actions */}
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Button 
              size={isMobile ? "sm" : "default"}
              variant="outline" 
              className={isMobile ? "px-2 py-1 text-xs h-7 bg-green-500 text-white hover:bg-green-600 border-green-500 hover:border-green-600" : "bg-green-500 text-white hover:bg-green-600 border-green-500 hover:border-green-600"}
              onClick={handleDepositClick}
              disabled={!asset.enabled}
            >
              <ArrowDownLeft className="mr-1 h-4 w-4" />
              Deposit
            </Button>
            <Button 
              size={isMobile ? "sm" : "default"}
              variant="outline" 
              className={isMobile ? "px-2 py-1 text-xs h-7 bg-red-500 text-white hover:bg-red-600 border-red-500 hover:border-red-600" : "bg-red-500 text-white hover:bg-red-600 border-red-500 hover:border-red-600"}
              onClick={handleWithdrawClick}
              disabled={!canWithdraw}
            >
              <ArrowUpRight className="mr-1 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Withdraw Dialog */}
      <WithdrawDialog 
        open={withdrawDialogOpen} 
        onOpenChange={setWithdrawDialogOpen} 
        asset={canWithdraw ? asset : null}
      />
    </>
  );
};

export default AssetRow;

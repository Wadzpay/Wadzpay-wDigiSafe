
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, ArrowUp, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useCryptoConversion } from '@/hooks/useCryptoConversion';
import LoadingSpinner from '@/components/LoadingSpinner';

interface WalletCardProps {
  address: string;
  balance: number;
  className?: string;
}

const WalletCard = ({ address, balance, className }: WalletCardProps) => {
  const [copied, setCopied] = useState(false);
  const { inrValue, isLoading: isRateLoading, refetchRate } = useCryptoConversion(balance);
  const [previousBalance, setPreviousBalance] = useState<number>(balance);

  // Monitor balance changes to trigger INR value refresh
  useEffect(() => {
    if (balance !== previousBalance) {
      // Balance has changed, let's update the INR value
      console.log(`Balance changed from ${previousBalance} to ${balance}, refreshing INR value`);
      refetchRate();
      setPreviousBalance(balance);
    }
  }, [balance, previousBalance, refetchRate]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied to clipboard');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const explorerUrl = `https://testnet.algoexplorer.io/address/${address}`;

  // Format currency values
  const formatINR = (value: number | null) => {
    if (value === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatAlgo = (value: number) => {
    return value.toFixed(value >= 1 ? 4 : 8);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Portfolio value (INR)</span>
              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                Testnet
              </Badge>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => window.open(explorerUrl, '_blank')}
                  >
                    <ExternalLink size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View on Testnet AlgoExplorer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Total value of your digital assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Total Value Section */}
            <div className="bg-muted p-4 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-algorand-blue opacity-10 rounded-full transform translate-x-6 -translate-y-6" />
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-algorand-blue opacity-10 rounded-full transform -translate-x-4 translate-y-4" />
              
              <div className="mb-1 text-sm text-muted-foreground">Total value</div>
              
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-3xl font-semibold relative z-10"
                >
                  {isRateLoading ? (
                    <div className="flex items-center gap-2 h-10">
                      <span className="text-muted-foreground">
                        <LoadingSpinner size="sm" />
                      </span>
                    </div>
                  ) : (
                    formatINR(inrValue)
                  )}
                </motion.div>
                
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  <span>0.00%</span>
                </Badge>
              </div>
            </div>
            
            {/* Currencies Breakdown */}
            <div className="space-y-3">
              {/* INR Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-red-100 w-8 h-8 rounded-full flex items-center justify-center text-red-700">
                    <IndianRupee size={16} />
                  </div>
                  <span>INR</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div>{isRateLoading ? '—' : formatINR(inrValue)}</div>
                  <div className="w-16 text-right">100.00%</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
                <div className="h-full bg-gray-700 rounded-full" style={{ width: '100%' }}></div>
              </div>
              
              {/* ALGO Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-blue-700">
                    <svg viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor">
                      <path d="M22.5 23.5H18l-5.4-9h-2.2v3.5h3.5v5.5h-9v-5.5h2v-14h2v-4h5l5.4 9h2.2v-3.5h-3.5v-5.5h9v5.5h-2v14h-2z"/>
                    </svg>
                  </div>
                  <span>ALGO</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div>{formatAlgo(balance)} ALGO</div>
                  <div className="w-16 text-right">&lt;0.01%</div>
                </div>
              </div>
              
              {/* Small indicator for ALGO */}
              <div className="flex items-center">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Diversify Section */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-sm">Diversify your portfolio</div>
              <Button variant="outline" disabled className="text-sm">
                Buy Crypto
              </Button>
            </div>
            
            {/* Wallet Address Section */}
            <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
              <div>
                {truncateAddress(address)}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopyAddress}
                className={cn(
                  "h-7 px-2 text-xs",
                  copied && "text-green-500"
                )}
              >
                {copied ? (
                  <Check size={14} className="mr-1" />
                ) : (
                  <Copy size={14} className="mr-1" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WalletCard;

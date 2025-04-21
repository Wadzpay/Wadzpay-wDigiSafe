
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WalletCard from '@/components/WalletCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useWallet } from '@/context/WalletContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const WalletSection = () => {
  const { wallet, balance, isLoading, walletError, retryWalletFetch } = useWallet();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const lastRefreshTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const REFRESH_COOLDOWN = 25000; // 25 seconds strictly enforced
  const isMobile = useIsMobile();
  
  // Update refresh time when wallet data changes
  useEffect(() => {
    if (wallet && !isLoading) {
      setLastRefresh(new Date());
    }
  }, [wallet, balance, isLoading]);

  // Timer effect to update seconds left countdown
  useEffect(() => {
    if (secondsLeft > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [secondsLeft]);

  const handleRefresh = async () => {
    // Strict rate limit for manual refreshes to 25 seconds
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    
    if (timeSinceLastRefresh < REFRESH_COOLDOWN) {
      const secondsToWait = Math.ceil((REFRESH_COOLDOWN - timeSinceLastRefresh) / 1000);
      setSecondsLeft(secondsToWait);
      toast.info(`Please wait ${secondsToWait} seconds before refreshing again`);
      return;
    }
    
    try {
      setIsRefreshing(true);
      lastRefreshTimeRef.current = now;
      setSecondsLeft(25); // Start the cooldown timer
      
      // Refresh wallet data
      await retryWalletFetch();
      
      // Update refresh time
      setLastRefresh(new Date());
      toast.success("Wallet data refreshed");
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
      toast.error("Failed to refresh wallet data");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {wallet ? (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {!isMobile ? (
                <span>Updates limited to once every 25 seconds</span>
              ) : (
                <span>25s update limit</span>
              )}
            </div>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing || secondsLeft > 0}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? (
                isMobile ? "Refreshing" : "Refreshing..."
              ) : secondsLeft > 0 ? (
                `Wait ${secondsLeft}s`
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
          <WalletCard 
            address={wallet.address} 
            balance={balance} 
          />
        </div>
      ) : (
        <Card className="h-auto py-4 sm:py-6">
          <CardContent className="flex flex-col items-center gap-4">
            {isLoading ? (
              <>
                <LoadingSpinner />
                <p className="text-center text-muted-foreground text-sm">
                  Connecting to your wallet...
                </p>
              </>
            ) : (
              <>
                <div className="p-3 sm:p-4 rounded-full bg-amber-100">
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-base sm:text-lg mb-1">Wallet Connection Issue</h3>
                  <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                    {walletError === 'wallet-not-found' ? 
                      "We couldn't find your wallet. It may still be in the process of being created." :
                      walletError === 'no-user-id' ?
                      "User ID not found. Please try logging out and logging in again." :
                      "There was a problem connecting to your wallet."}
                  </p>
                  <Button onClick={retryWalletFetch} size={isMobile ? "sm" : "default"} className="w-full md:w-auto">
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Retry Connection
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default WalletSection;

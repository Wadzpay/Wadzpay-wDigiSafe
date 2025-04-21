
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface ExchangeRates {
  algo: {
    inr: number;
  }
}

export const useCryptoConversion = (algoBalance: number) => {
  const [inrValue, setInrValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const MIN_FETCH_INTERVAL = 30000; // 30 seconds

  // Fetch exchange rate
  const fetchExchangeRate = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    
    if (timeSinceLastFetch < MIN_FETCH_INTERVAL && inrValue !== null) {
      console.log(`Rate limiting exchange rate fetch: only ${Math.round(timeSinceLastFetch/1000)}s since last fetch (limit: 30s)`);
      // Even if we don't fetch a new rate, we should still update the INR value with the current rate
      if (inrValue !== null) {
        const currentRate = inrValue / (algoBalance || 1);
        const newInrValue = algoBalance * currentRate;
        setInrValue(newInrValue);
      }
      return;
    }
    
    setLastFetchTime(now);
    setIsLoading(true);
    
    try {
      // Use CoinGecko API to get ALGO to INR conversion rate
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=inr');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }
      
      const data = await response.json();
      const inrRate = data.algorand.inr;
      
      if (inrRate) {
        const convertedValue = algoBalance * inrRate;
        setInrValue(convertedValue);
        console.log(`Converted ${algoBalance} ALGO to ${convertedValue} INR (rate: ${inrRate})`);
      } else {
        throw new Error('Invalid exchange rate data');
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Use a fallback rate if API fails (approximately 60 INR per ALGO as of now)
      const fallbackRate = 60;
      setInrValue(algoBalance * fallbackRate);
      toast.error('Could not fetch latest exchange rates. Using estimated values.');
    } finally {
      setIsLoading(false);
    }
  }, [algoBalance, lastFetchTime, inrValue]);

  // Fetch exchange rate when the component mounts or when algoBalance changes
  useEffect(() => {
    fetchExchangeRate();
  }, [algoBalance, fetchExchangeRate]);

  return {
    inrValue,
    isLoading,
    refetchRate: fetchExchangeRate
  };
};

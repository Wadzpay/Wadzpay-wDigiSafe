
import { useState } from 'react';
import { getTransactions } from '@/lib/transactions';
import { Transaction } from '@/lib/types';
import { toast } from 'sonner';

export const useFetchTransactions = (wallet: any) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTransactions = async () => {
    if (!wallet) {
      console.log('Cannot fetch transactions: wallet not initialized');
      return [];
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching transactions...');
      const response = await getTransactions();
      const txList = response.transactions;
      console.log(`Fetched ${txList.length} transactions`);
      setTransactions(txList);
      setIsLoading(false);
      return txList;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history');
      setIsLoading(false);
      return [];
    }
  };

  return {
    transactions,
    isLoading,
    setTransactions,
    fetchTransactions
  };
};

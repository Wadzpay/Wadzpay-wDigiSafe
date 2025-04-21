
import { useState } from 'react';
import { getNewTransactions, Transaction } from '@/lib/api';
import { toast } from 'sonner';

export const useTransactionUpdates = (wallet: any, transactions: Transaction[], setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>) => {
  const fetchNewTransactions = async (lastTransactionTimestamp?: string): Promise<Transaction[]> => {
    if (!wallet) {
      return [];
    }
    
    try {
      // Only fetch new transactions since the last known transaction
      const newTxList = await getNewTransactions(lastTransactionTimestamp);
      
      if (newTxList.length > 0) {
        // Update the transactions list with new transactions
        const updatedTransactions = [...newTxList, ...transactions];
        // Sort by timestamp (newest first)
        updatedTransactions.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setTransactions(updatedTransactions);
        
        // Notify about the new transactions
        toast.success(`${newTxList.length} new transaction${newTxList.length > 1 ? 's' : ''} received!`);
      }
      
      return newTxList;
    } catch (error) {
      console.error('Error fetching new transactions:', error);
      return [];
    }
  };

  return {
    fetchNewTransactions
  };
};

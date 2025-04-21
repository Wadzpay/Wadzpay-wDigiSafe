
import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/lib/types';
import { getTransactions } from '@/lib/transactions';

export const useTransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [prevTokens, setPrevTokens] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const loadTransactions = useCallback(async (nextTokenParam?: string, isPrevious = false) => {
    setIsLoading(true);
    try {
      const useToken = isPrevious 
        ? prevTokens[prevTokens.length - 1] 
        : nextTokenParam;
      
      console.log('Fetching transactions...');
      
      const response = await getTransactions({
        next: useToken,
        limit: 50
      });
      
      setTransactions(response.transactions);
      
      if (isPrevious) {
        setPrevTokens(prev => prev.slice(0, -1));
        setCurrentPage(prev => prev - 1);
      } else if (nextTokenParam) {
        setPrevTokens(prev => [...prev, nextTokenParam]);
        setCurrentPage(prev => prev + 1);
      } else {
        setPrevTokens([]);
        setCurrentPage(1);
      }
      
      setNextToken(response.next);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [prevTokens]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, [loadTransactions]);

  const handleNextPage = useCallback(() => {
    if (nextToken) {
      loadTransactions(nextToken);
    }
  }, [nextToken, loadTransactions]);

  const handlePreviousPage = useCallback(() => {
    if (prevTokens.length > 0) {
      loadTransactions(undefined, true);
    }
  }, [prevTokens, loadTransactions]);

  const filteredTransactions = transactions.filter(tx => 
    tx.txHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    transactions: filteredTransactions,
    isLoading: isLoading || refreshing,
    refreshing,
    searchTerm,
    setSearchTerm,
    currentPage,
    handleRefresh,
    handleNextPage,
    handlePreviousPage,
    hasPreviousPage: prevTokens.length > 0,
    hasNextPage: !!nextToken
  };
};


import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TransactionTable from '@/components/TransactionTable';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import SearchBar from '@/components/transaction/SearchBar';
import PaginationControls from '@/components/transaction/PaginationControls';

const TransactionHistory = () => {
  const { isAuthenticated } = useAuth();
  const {
    transactions,
    isLoading,
    refreshing,
    searchTerm,
    setSearchTerm,
    currentPage,
    handleRefresh,
    handleNextPage,
    handlePreviousPage,
    hasPreviousPage,
    hasNextPage
  } = useTransactionHistory();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-6xl py-8 px-4 md:px-6">
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
            <p className="text-muted-foreground mt-1">
              View and search your past Algorand transactions
            </p>
          </motion.div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing || isLoading}
                className="flex items-center gap-2"
              >
                {refreshing ? <LoadingSpinner size="sm" /> : <RefreshCw size={16} />}
                <span>Refresh</span>
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <TransactionTable 
              transactions={transactions}
              isLoading={isLoading}
            />
            
            {transactions.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                hasPreviousPage={hasPreviousPage}
                hasNextPage={hasNextPage}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransactionHistory;

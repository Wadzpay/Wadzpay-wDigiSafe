
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CustomerSummary, DashboardStats, WalletData, TransactionData } from '@/types/admin';
import { processCustomerData } from '@/utils/adminDataProcessing';

export const useAdminDashboardData = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalWallets: 0,
    totalTransactions: 0,
    totalDepositsCount: 0,
    totalDepositsAmount: 0,
    totalWithdrawalsCount: 0,
    totalWithdrawalsAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    fetchCustomerData();
    
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      fetchCustomerData();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch all wallets with improved logging
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('*');
      
      if (walletsError) {
        console.error('Error fetching wallets:', walletsError);
        throw walletsError;
      }
      
      const wallets = (walletsData || []) as WalletData[];
      console.log('Wallets data fetched:', wallets.length, 'wallets');
      
      // Try to get all wallets using direct query as fallback
      if (wallets.length === 0) {
        console.log('No wallets found in standard query, trying direct query...');
        try {
          // Use from().select() instead of rpc() for get_all_wallets
          const { data: directWallets, error: directError } = await supabase
            .from('wallets')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (directError) {
            console.error('Error fetching wallets via direct query:', directError);
          } else if (directWallets && directWallets.length > 0) {
            console.log('Successfully fetched', directWallets.length, 'wallets via direct query');
          }
        } catch (err) {
          console.error('Exception in direct wallet query:', err);
        }
      }
      
      // Fetch all transactions
      const { data: transactionsData, error: txError } = await supabase
        .from('transactions')
        .select('*');
      
      if (txError) {
        console.error('Error fetching transactions:', txError);
        throw txError;
      }

      const transactions = (transactionsData || []) as TransactionData[];
      console.log('Transactions data fetched:', transactions.length, 'transactions');
      
      // Enhanced customer fetching with expanded logging
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, customer_id');
      
      if (customersError) {
        console.error('Error fetching customers:', customersError);
        throw customersError;
      }

      const customers = customersData || [];
      console.log('Customers data fetched:', customers.length, 'customers');
      
      // Process all the fetched data
      const { customerSummaries, dashboardStats } = await processCustomerData(
        wallets, 
        transactions, 
        customers
      );
      
      setCustomers(customerSummaries);
      setStats(dashboardStats);
      setLastRefreshed(new Date());
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer data');
      setLoading(false);
    }
  };

  return { customers, stats, loading, lastRefreshed, refreshData: fetchCustomerData };
};

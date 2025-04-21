
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  id: string;
  tx_hash: string;
  wallet_address: string;
  from: string;
  to: string;
  amount: number;
  type: string;
  timestamp: string;
  note: string | null;
  customer_id: string | null;
  customer_name?: string;
}

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [customerMap, setCustomerMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // First get all customers to build a map
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id, customer_id');
      
      if (customerError) {
        throw customerError;
      }
      
      // Build customer ID to customer name map
      const customerIdMap: Record<string, string> = {};
      if (customers) {
        customers.forEach(customer => {
          customerIdMap[customer.id] = customer.customer_id;
        });
      }
      
      setCustomerMap(customerIdMap);
      
      // Fetch transactions - now using transactions table instead of transaction_history
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Add customer names
      const enhancedTransactions = data?.map(tx => ({
        ...tx,
        customer_name: tx.customer_id ? customerIdMap[tx.customer_id] || 'Unknown' : 'Unknown'
      })) || [];
      
      setTransactions(enhancedTransactions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      setLoading(false);
    }
  };

  // Filter transactions based on search term and type
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      (tx.tx_hash && tx.tx_hash.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.wallet_address && tx.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.from && tx.from.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.to && tx.to.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.customer_name && tx.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && tx.type === filterType;
  });

  // Helper to format addresses
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <AdminLayout title="Transaction History">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by hash, address, customer or note"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="send">Send</SelectItem>
              <SelectItem value="receive">Receive</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading transactions...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">No transactions found</TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.customer_name || 'Unknown'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tx.type === 'send' || tx.type === 'withdrawal' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {tx.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{formatAddress(tx.from)}</TableCell>
                        <TableCell className="font-mono text-xs">{formatAddress(tx.to)}</TableCell>
                        <TableCell>{tx.amount.toFixed(2)} ALGO</TableCell>
                        <TableCell title={new Date(tx.timestamp).toLocaleString()}>
                          {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                        </TableCell>
                        <TableCell>{tx.note || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <span title={tx.tx_hash}>{formatAddress(tx.tx_hash)}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminTransactions;


import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CustomerSummary } from '@/types/admin';

interface CustomerTableProps {
  customers: CustomerSummary[];
}

const CustomerTable: React.FC<CustomerTableProps> = ({ customers }) => {
  // Filter to only show customers with wallets
  const customersWithWallets = customers.filter(
    customer => customer.walletAddress !== 'No wallet'
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-700">Customer ID</TableHead>
            <TableHead className="font-semibold text-gray-700">Wallet Address</TableHead>
            <TableHead className="font-semibold text-gray-700">Current Balance</TableHead>
            <TableHead className="font-semibold text-gray-700">Transactions</TableHead>
            <TableHead className="font-semibold text-gray-700">Total Deposits (Receive)</TableHead>
            <TableHead className="font-semibold text-gray-700">Total Withdrawals (Send)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customersWithWallets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No customers with wallets found
              </TableCell>
            </TableRow>
          ) : (
            customersWithWallets.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium">{customer.customerId}</TableCell>
                <TableCell className="font-mono text-xs bg-gray-100 rounded px-2">
                  {`${customer.walletAddress.slice(0, 6)}...${customer.walletAddress.slice(-4)}`}
                </TableCell>
                <TableCell className="font-medium">{customer.balance.toFixed(2)} <span className="text-gray-500 text-xs">ALGO</span></TableCell>
                <TableCell>{customer.transactionCount}</TableCell>
                <TableCell>{customer.totalDeposits} <span className="text-gray-500">({customer.depositAmount.toFixed(2)} ALGO)</span></TableCell>
                <TableCell>{customer.totalWithdrawals} <span className="text-gray-500">({customer.withdrawalAmount.toFixed(2)} ALGO)</span></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerTable;

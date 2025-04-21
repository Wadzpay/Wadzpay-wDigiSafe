
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerTable from './CustomerTable';
import { CustomerSummary } from '@/types/admin';
import { Users } from 'lucide-react';

interface CustomerOverviewProps {
  customers: CustomerSummary[];
}

const CustomerOverview: React.FC<CustomerOverviewProps> = ({ customers }) => {
  // Count customers with wallets
  const customersWithWalletsCount = customers.filter(
    customer => customer.walletAddress !== 'No wallet'
  ).length;

  return (
    <Card className="border-t-2 border-t-blue-500 shadow-md overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg text-gray-800">
              Customer Overview
              <span className="text-xs font-normal text-muted-foreground ml-2">
                (Deposits = Receive, Withdrawals = Send)
              </span>
            </CardTitle>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
          <p className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            {customersWithWalletsCount} active wallet{customersWithWalletsCount !== 1 ? 's' : ''}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <CustomerTable customers={customers} />
      </CardContent>
    </Card>
  );
};

export default CustomerOverview;

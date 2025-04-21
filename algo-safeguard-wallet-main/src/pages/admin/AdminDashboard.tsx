
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardStatsCards from '@/components/admin/DashboardStats';
import CustomerOverview from '@/components/admin/CustomerOverview';
import DashboardLoading from '@/components/admin/DashboardLoading';
import { useAdminDashboardData } from '@/hooks/useAdminDashboardData';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { customers, stats, loading, lastRefreshed, refreshData } = useAdminDashboardData();

  const handleRefresh = () => {
    refreshData();
  };

  // Format the last refreshed time
  const formattedLastRefreshed = lastRefreshed.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <AdminLayout title="Dashboard">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {formattedLastRefreshed}
          </span>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
            className="hover:bg-blue-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>
      
      {loading ? (
        <DashboardLoading />
      ) : (
        <div className="space-y-8">
          <DashboardStatsCards stats={stats} />
          <CustomerOverview customers={customers} />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;

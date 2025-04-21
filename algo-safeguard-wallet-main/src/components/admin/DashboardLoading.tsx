
import React from 'react';
import { Loader2 } from 'lucide-react';

const DashboardLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading dashboard data...</span>
    </div>
  );
};

export default DashboardLoading;

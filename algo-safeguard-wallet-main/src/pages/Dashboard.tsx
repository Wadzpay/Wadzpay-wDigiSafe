
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import WalletSection from '@/components/dashboard/WalletSection';
import AssetsSection from '@/components/dashboard/AssetsSection';
import { useWallet } from '@/context/WalletContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const { isLoading } = useWallet();
  const isMobile = useIsMobile();

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-6xl py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
          {/* Change layout to single column with wallet above assets on all screen sizes */}
          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            {/* Wallet section always first */}
            <WalletSection />
            
            {/* Assets section always below wallet */}
            <AssetsSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;


import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Table } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Check if admin is authenticated
    const verifyAdminSession = async () => {
      setIsVerifying(true);
      const adminId = localStorage.getItem('admin_id');
      
      if (!adminId) {
        navigate('/admin');
        return;
      }
      
      try {
        // Verify admin session with the edge function
        const response = await supabase.functions.invoke('admin-auth', {
          method: 'POST',
          body: { action: 'verify', adminId },
        });

        if (!response.data?.success) {
          // Clear invalid session
          localStorage.removeItem('admin_id');
          localStorage.removeItem('admin_username');
          localStorage.removeItem('admin_authenticated');
          navigate('/admin');
        }
      } catch (error) {
        console.error('Session verification error:', error);
        localStorage.removeItem('admin_id');
        localStorage.removeItem('admin_username');
        localStorage.removeItem('admin_authenticated');
        navigate('/admin');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdminSession();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_id');
    localStorage.removeItem('admin_username');
    navigate('/admin');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner className="mx-auto h-8 w-8 mb-4" />
          <p className="text-gray-600">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/c088585a-e0cf-4b9a-b8e0-d1f743d9ac6e.png" 
              alt="WadzPay Logo" 
              className="h-8 w-auto" 
            />
          </div>
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin/transactions')}
              className="flex items-center gap-2"
            >
              <Table className="h-4 w-4" />
              Transactions
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

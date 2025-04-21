
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const checkAdminSession = async () => {
      const adminId = localStorage.getItem('admin_id');
      if (adminId) {
        try {
          // Verify admin session
          const response = await supabase.functions.invoke('admin-auth', {
            method: 'POST',
            body: { action: 'verify', adminId },
          });

          if (response.data?.success) {
            navigate('/admin/dashboard');
          } else {
            // Clear invalid session
            localStorage.removeItem('admin_id');
            localStorage.removeItem('admin_username');
            localStorage.removeItem('admin_authenticated');
          }
        } catch (error) {
          console.error('Session verification error:', error);
          localStorage.removeItem('admin_id');
          localStorage.removeItem('admin_username');
          localStorage.removeItem('admin_authenticated');
        }
      }
    };

    checkAdminSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the admin-auth edge function
      const response = await supabase.functions.invoke('admin-auth', {
        method: 'POST',
        body: { action: 'login', username, password },
      });

      if (response.data?.success) {
        // Store admin session information
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_id', response.data.admin.id);
        localStorage.setItem('admin_username', response.data.admin.username);
        
        toast.success('Successfully logged in as admin');
        navigate('/admin/dashboard');
      } else {
        toast.error(response.data?.message || 'Invalid admin credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to authenticate: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[400px] shadow-lg border-t-4 border-t-blue-500">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/c088585a-e0cf-4b9a-b8e0-d1f743d9ac6e.png" 
              alt="WadzPay Logo" 
              className="h-12 w-auto" 
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="px-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
                className="w-full py-2 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full py-2 rounded-md"
              />
            </div>
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? <LoadingSpinner className="mr-2" /> : null}
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500 px-8 pb-8">
          Admin access only. Unauthorized access is prohibited.
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;

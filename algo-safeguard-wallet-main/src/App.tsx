
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import './App.css';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import TransactionHistory from '@/pages/TransactionHistory';
import MnemonicPage from '@/pages/MnemonicPage';
import NotFound from '@/pages/NotFound';
import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { Suspense } from 'react';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminTransactions from '@/pages/admin/AdminTransactions';

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <Router>
          <WalletProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<TransactionHistory />} />
                <Route path="/mnemonic" element={<MnemonicPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster position="top-right" />
          </WalletProvider>
        </Router>
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;

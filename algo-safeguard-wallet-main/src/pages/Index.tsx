
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const Index = () => {
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-left space-y-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col items-start"
              >
                {/* Logo instead of text */}
                <div className="h-16 w-auto mb-6">
                  <img 
                    src="/lovable-uploads/c088585a-e0cf-4b9a-b8e0-d1f743d9ac6e.png" 
                    alt="WadzPay Logo" 
                    className="h-full w-auto object-contain" 
                  />
                </div>
                
                <p className="mt-3 text-xl text-muted-foreground">
                  Enterprise-grade Algorand custody wallet solution
                </p>
              </motion.div>
              
              <motion.ul 
                className="space-y-3 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-algorand-blue" />
                  <span>Secure digital asset custody</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-algorand-blue" />
                  <span>Real-time balance updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-algorand-blue" />
                  <span>Simplified transaction management</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-algorand-blue" />
                  <span>Comprehensive transaction history</span>
                </li>
              </motion.ul>
            </motion.div>
            
            <AuthForm />
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} WadzPay Wallet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;

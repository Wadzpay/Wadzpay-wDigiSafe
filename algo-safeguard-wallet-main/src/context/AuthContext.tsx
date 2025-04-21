
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authenticateUser, registerCustomer } from '@/lib/api';
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (customerId: string, password: string) => Promise<void>;
  register: (customerId: string, password: string) => Promise<{ mnemonic?: string, walletAddress?: string, success: boolean } | undefined>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for auth token in local storage
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          console.log('Found auth token in local storage');
          setIsAuthenticated(true);
          
          // Try to obtain and store user ID if not already stored
          if (!localStorage.getItem('user_id')) {
            // Try to get user ID from customers table using customer_id
            const customerId = localStorage.getItem('customer_id');
            if (customerId) {
              await retrieveUserIdFromCustomers(customerId);
            }
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Helper function to retrieve user ID from customers table
  const retrieveUserIdFromCustomers = async (customerId: string) => {
    try {
      console.log('Trying to retrieve user ID using customer ID:', customerId);
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();
        
      if (data && data.id) {
        console.log('Found user ID from customers table:', data.id);
        localStorage.setItem('user_id', data.id);
        return data.id;
      } else if (error) {
        console.error('Error retrieving user ID from customers:', error);
      }
      return null;
    } catch (err) {
      console.error('Failed to retrieve user ID from customers:', err);
      return null;
    }
  };

  const login = async (customerId: string, password: string) => {
    setIsLoading(true);
    try {
      // Use our custom authentication API
      const { token, customer } = await authenticateUser(customerId, password);
      
      // Store authentication data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('customer_id', customerId);
      
      // Store the customer ID explicitly for wallet lookups
      let userId = null;
      if (customer && customer.id) {
        console.log('Storing user ID on login:', customer.id);
        localStorage.setItem('user_id', customer.id);
        userId = customer.id;
      } else {
        // If customer ID is missing, try to retrieve it 
        userId = await retrieveUserIdFromCustomers(customerId);
      }
      
      // Set authentication state
      setIsAuthenticated(true);
      
      // Trigger immediate wallet fetch after login with improved data
      window.dispatchEvent(new CustomEvent('wallet-fetch-needed', {
        detail: {
          userId,
          customerId,
          source: 'login-completion',
          timestamp: Date.now()
        }
      }));
      
      // Add a second attempt with a delay for reliability
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('wallet-refresh-needed', {
          detail: {
            userId,
            customerId,
            source: 'login-completion-delayed',
            timestamp: Date.now()
          }
        }));
      }, 800);
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (customerId: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await registerCustomer(customerId, password);
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('customer_id', customerId);
      
      // Store registration timestamp
      localStorage.setItem('registration_timestamp', Date.now().toString());
      
      // If we get a customer ID back, store it
      if (result.customerId) {
        console.log('Storing user ID on registration:', result.customerId);
        localStorage.setItem('user_id', result.customerId);
      }
      
      // Store mnemonic and wallet address if available
      if (result.mnemonic) {
        localStorage.setItem('registration_mnemonic', result.mnemonic);
      }
      
      if (result.walletAddress) {
        localStorage.setItem('temp_wallet_address', result.walletAddress);
      }
      
      setIsAuthenticated(true);
      
      // Return the result to be handled by the caller
      return { 
        mnemonic: result.mnemonic,
        walletAddress: result.walletAddress,
        success: result.success 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('customer_id');
    localStorage.removeItem('temp_wallet_address');
    localStorage.removeItem('registration_timestamp');
    localStorage.removeItem('registration_mnemonic');
    
    setIsAuthenticated(false);
    
    // Force reload to clear all application state
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

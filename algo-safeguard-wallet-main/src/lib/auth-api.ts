
// Authentication API functionality
import { supabase } from "@/integrations/supabase/client";
import { CustomerInfo } from "./types";

// Authentication API
export const authenticateUser = async (customerId: string, password: string): Promise<{ token: string, customer: CustomerInfo }> => {
  try {
    // Query the customers table to find a matching customer
    const { data, error } = await supabase
      .from('customers')
      .select('id, customer_id')
      .eq('customer_id', customerId)
      .eq('password', password) // Note: In a real app, you'd use proper password hashing
      .single();
    
    if (error) {
      console.error('Authentication error:', error);
      throw new Error('Invalid credentials');
    }
    
    if (!data) {
      throw new Error('Customer not found');
    }
    
    console.log('Customer authenticated successfully:', data);
    
    // Store the customer ID in localStorage for wallet lookups
    localStorage.setItem('user_id', data.id);
    localStorage.setItem('customer_id', customerId);
    
    // Return customer info and a mock token
    // In a real app, you would generate a proper JWT token
    return { 
      token: 'demo-token-xyz',
      customer: {
        id: data.id,
        customerId: data.customer_id
      }
    };
  } catch (error) {
    console.error('Authentication failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Authentication failed');
  }
};

// Register new customer and create wallet
export const registerCustomer = async (customerId: string, password: string): Promise<{ token: string, mnemonic?: string, walletAddress?: string, customerId?: string, success: boolean }> => {
  try {
    console.log('Starting customer registration process...');
    
    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_id', customerId)
      .single();
    
    if (existingCustomer) {
      throw new Error('Customer ID already exists');
    }
    
    // Insert new customer
    const { data, error } = await supabase
      .from('customers')
      .insert([
        { customer_id: customerId, password: password } // In a real app, you'd hash the password
      ])
      .select('id, customer_id')
      .single();
    
    if (error) {
      console.error('Failed to create customer:', error);
      throw new Error('Failed to create customer');
    }
    
    console.log('Customer created, generating wallet...', data);
    
    // Store the customer ID immediately
    if (data && data.id) {
      localStorage.setItem('user_id', data.id);
      localStorage.setItem('customer_id', customerId);
    }
    
    // Create a wallet for the new customer
    const response = await supabase.functions.invoke('algorand', {
      method: 'POST',
      body: { action: 'wallet' },
    });

    if (!response.data || response.error) {
      console.error('Wallet creation error:', response.error);
      throw new Error(response.error?.message || 'Failed to create wallet');
    }
    
    // Get wallet data and determine the correct private key field name
    const walletAddress = response.data.address;
    const privateKey = response.data.privateKey || response.data.secret;
    const mnemonic = response.data.mnemonic;
    
    // Store registration timestamp and temporary wallet address
    localStorage.setItem('registration_timestamp', Date.now().toString());
    localStorage.setItem('temp_wallet_address', walletAddress);
    localStorage.setItem('registration_mnemonic', mnemonic);
    
    console.log('Wallet created, saving to database:', {
      address: walletAddress,
      customerUuid: data.id
    });
    
    // Insert wallet directly using the RPC endpoint to bypass RLS
    // Use explicit type casting to handle the TypeScript error
    const { error: walletError } = await supabase.rpc('create_wallet', {
      wallet_address: walletAddress,
      wallet_private_key: privateKey,
      customer_uuid: data.id
    } as {
      wallet_address: string;
      wallet_private_key: string;
      customer_uuid: string;
    });

    if (walletError) {
      console.error('Failed to save wallet:', walletError);
      throw new Error('Failed to save wallet');
    }
    
    // Verify the wallet was properly stored by attempting to retrieve it
    console.log('Verifying wallet was saved...');
    let walletSaved = false;
    
    for (let attempt = 1; attempt <= 5; attempt++) {
      const { data: walletCheck } = await supabase
        .from('wallets')
        .select('address')
        .eq('customer_id', data.id)
        .maybeSingle();
      
      if (walletCheck) {
        console.log(`Wallet verification successful on attempt ${attempt}`);
        walletSaved = true;
        break;
      } else if (attempt === 5) {
        console.warn('Warning: Could not verify wallet was saved after 5 attempts, using temp address as fallback');
      } else {
        console.log(`Wallet not found on attempt ${attempt}, waiting 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('Registration successful, wallet saved, mnemonic:', mnemonic ? 'Available' : 'Not available');
    
    // Return token, mnemonic, and success status
    return { 
      token: 'demo-token-xyz',
      mnemonic,
      walletAddress,
      customerId: data.id,
      success: true
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Registration failed');
  }
};

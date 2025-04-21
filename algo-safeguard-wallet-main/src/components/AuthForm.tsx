import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  customerId: z.string().min(6, {
    message: "Customer ID must be at least 6 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const registerSchema = z.object({
  customerId: z.string().min(6, {
    message: "Customer ID must be at least 6 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function AuthForm() {
  const [activeTab, setActiveTab] = useState('login');
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      customerId: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      customerId: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_id', values.customerId)
        .single();
      
      if (error || !data) {
        toast.error('Customer ID not found. Please register first.');
        return;
      }

      toast.loading('Logging in...', { id: 'login' });
      await login(values.customerId, values.password);
      
      const eventData = {
        detail: {
          source: 'login-completion',
          timestamp: Date.now(),
          userId: localStorage.getItem('user_id'),
          customerId: values.customerId
        }
      };
      
      window.dispatchEvent(new CustomEvent('wallet-fetch-needed', eventData));
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('wallet-refresh-needed', eventData));
      }, 300);
      
      toast.dismiss('login');
      toast.success('Successfully logged in');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      
    } catch (error) {
      toast.dismiss('login');
      console.error('Login error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      toast.loading('Creating your account and wallet...', { id: 'register' });
      const result = await register(values.customerId, values.password);
      
      if (result?.mnemonic && result.success) {
        toast.dismiss('register');
        toast.success('Account created successfully');
        
        localStorage.setItem('registration_timestamp', Date.now().toString());
        
        if (result.mnemonic) {
          localStorage.setItem('registration_mnemonic', result.mnemonic);
          localStorage.setItem('mnemonic_confirmed', 'false');
          localStorage.removeItem('wallet_creation_confirmed');
        }
        
        if (result.walletAddress) {
          localStorage.setItem('temp_wallet_address', result.walletAddress);
        }
        
        localStorage.setItem('auth_token', 'demo-token-xyz');
        
        const eventData = {
          detail: {
            source: 'registration-completion',
            timestamp: Date.now(),
            userId: localStorage.getItem('user_id'),
            customerId: values.customerId,
            tempAddress: result.walletAddress
          }
        };
        
        window.dispatchEvent(new CustomEvent('wallet-fetch-needed', eventData));
        
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('wallet-refresh-needed', eventData));
        }, 300);
        
        toast.info('Redirecting to recovery phrase page');
        
        setTimeout(() => {
          navigate('/mnemonic');
        }, 500);
        
        return;
      } else {
        toast.dismiss('register');
        toast.success('Account created successfully');
        
        const eventData = {
          detail: {
            source: 'registration-completion',
            timestamp: Date.now(),
            userId: localStorage.getItem('user_id'),
            customerId: values.customerId
          }
        };
        
        window.dispatchEvent(new CustomEvent('wallet-fetch-needed', eventData));
        
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('wallet-refresh-needed', eventData));
        }, 300);
        
        navigate('/dashboard');
      }
    } catch (error) {
      toast.dismiss('register');
      console.error('Auth error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">WadzPay</CardTitle>
        <CardDescription>
          {activeTab === 'login' 
            ? 'Sign in to your account' 
            : 'Create a new account to get started with ALGO'}
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <CardContent className="space-y-4 pt-4">
                <FormField
                  control={loginForm.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your customer ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner className="mr-2" /> : null}
                  Login
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="register">
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
              <CardContent className="space-y-4 pt-4">
                <FormField
                  control={registerForm.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Create a customer ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Retype password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  By registering, a new Algorand wallet will be created for you. Your recovery phrase will be shown only once - make sure to save it.
                </p>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner className="mr-2" /> : null}
                  Register
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

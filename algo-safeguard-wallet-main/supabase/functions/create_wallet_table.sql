
-- Create wallets table to store wallet info
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id),
  address TEXT NOT NULL,
  private_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own wallet
CREATE POLICY "Users can view their own wallet" 
  ON public.wallets 
  FOR SELECT 
  USING (auth.uid() = customer_id);

-- Create policy to allow users to insert their own wallet
CREATE POLICY "Users can create their own wallet" 
  ON public.wallets 
  FOR INSERT 
  WITH CHECK (auth.uid() = customer_id);

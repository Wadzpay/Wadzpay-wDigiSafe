
-- Create a function to get all wallets (bypass RLS)
CREATE OR REPLACE FUNCTION public.get_all_wallets()
RETURNS SETOF wallets
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.wallets;
$$;

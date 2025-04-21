
-- Create a function that will be used to create wallets while bypassing RLS
CREATE OR REPLACE FUNCTION public.create_wallet(
  wallet_address TEXT,
  wallet_private_key TEXT,
  customer_uuid UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.wallets (address, private_key, customer_id)
  VALUES (wallet_address, wallet_private_key, customer_uuid);
END;
$$;

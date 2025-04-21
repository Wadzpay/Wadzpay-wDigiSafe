
-- Create a function that will be used to retrieve wallet while bypassing RLS
CREATE OR REPLACE FUNCTION public.get_wallet_by_customer_id(
  customer_uuid UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  wallet_record JSONB;
BEGIN
  SELECT jsonb_build_object(
    'address', address,
    'private_key', private_key,
    'created_at', created_at
  ) INTO wallet_record
  FROM public.wallets
  WHERE customer_id = customer_uuid
  LIMIT 1;
  
  RETURN wallet_record;
END;
$$;

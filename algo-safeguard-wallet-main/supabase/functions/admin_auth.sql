
-- Create admin_users table to store admin credentials
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Insert the default admin user (you should change this password in production)
-- Note: In a real system, you would use proper password hashing
INSERT INTO public.admin_users (username, password)
VALUES ('admin', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Function to authenticate admin users
CREATE OR REPLACE FUNCTION authenticate_admin(admin_username TEXT, admin_password TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record record;
  result jsonb;
BEGIN
  -- Check if the admin exists with the provided credentials
  SELECT * INTO admin_record
  FROM public.admin_users
  WHERE username = admin_username AND password = admin_password;
  
  -- If admin is found, return success with admin data
  IF found THEN
    -- Update last login timestamp
    UPDATE public.admin_users
    SET last_login = now()
    WHERE id = admin_record.id;
    
    result := jsonb_build_object(
      'success', true,
      'message', 'Authentication successful',
      'admin', jsonb_build_object(
        'id', admin_record.id,
        'username', admin_record.username
      )
    );
    
    RETURN result;
  ELSE
    -- Return failure if no matching admin
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
END;
$$;

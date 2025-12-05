-- 1. First, clear out the broken user to start fresh
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'hod@mca.edu';
  
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.users WHERE id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
    RAISE NOTICE 'Deleted old HOD user';
  END IF;
END $$;

-- 2. Create the HOD user correctly
-- We use pgcrypto for the password. 
-- NOTE: If this still fails, we will fallback to manual registration.
create extension if not exists pgcrypto;

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'hod@mca.edu',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "hod", "full_name": "Head of Department"}',
  now(),
  now(),
  '',
  ''
);

-- 3. Ensure public profile exists and has correct role
INSERT INTO public.users (id, email, role, full_name)
SELECT id, email, 'hod', 'Head of Department'
FROM auth.users 
WHERE email = 'hod@mca.edu'
ON CONFLICT (id) DO UPDATE
SET role = 'hod', full_name = 'Head of Department';

-- 4. FIX RLS RECURSION (Common cause of 500 errors)
-- We replace the policy that might be causing infinite loops
DROP POLICY IF EXISTS "HOD and Admin can view all profiles" ON public.users;

-- Create a secure function to check roles without triggering RLS on public.users recursively
CREATE OR REPLACE FUNCTION public.is_admin_or_hod()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('hod', 'admin')
  );
$$;

-- Apply the safe policy
CREATE POLICY "HOD and Admin can view all profiles" 
ON public.users
FOR SELECT 
USING ( public.is_admin_or_hod() );



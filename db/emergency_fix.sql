-- EMERGENCY FIX FOR 500 ERRORS
-- Run this entire script in Supabase SQL Editor

-- 1. Temporarily disable RLS to ensure we can fix data
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Ensure HOD user exists in public.users
-- This fixes the case where auth.users exists but public.users is missing
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'Head of Department'),
  'hod'
FROM auth.users 
WHERE email = 'hod@mca.edu'
ON CONFLICT (id) DO UPDATE 
SET role = 'hod';

-- 3. Fix the RLS Recursion Bug (The most likely cause of 500s)
-- We drop all existing policies to be safe and re-create them correctly.

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "HOD and Admin can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;

-- Helper function to check role safely (bypassing RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- Policy 1: Users can read their own data
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: HOD/Faculty can view all profiles (using the secure function to avoid recursion)
CREATE POLICY "Staff can view all profiles" 
ON public.users 
FOR SELECT 
USING (
  public.get_user_role(auth.uid()) IN ('hod', 'faculty', 'admin')
);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- 4. Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Verify it worked
SELECT * FROM public.users WHERE email = 'hod@mca.edu';

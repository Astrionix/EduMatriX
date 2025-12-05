-- Fix for 500 Internal Server Error due to infinite recursion in RLS policies

-- 1. Create a secure function to check for HOD/Admin role
-- This function runs with SECURITY DEFINER, bypassing RLS to avoid recursion
CREATE OR REPLACE FUNCTION public.is_hod_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('hod', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic policy
DROP POLICY IF EXISTS "HOD and Admin can view all profiles" ON public.users;

-- 3. Re-create the policy using the secure function
CREATE POLICY "HOD and Admin can view all profiles" ON public.users
  FOR SELECT USING (
    is_hod_or_admin()
  );

-- 4. Ensure the basic self-view policy exists (this one was likely fine, but good to ensure)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (
    auth.uid() = id
  );

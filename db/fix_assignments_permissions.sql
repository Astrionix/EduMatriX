-- COMPREHENSIVE RLS FIX FOR ASSIGNMENTS

-- 1. Enable RLS (just in case)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh and avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view assignments" ON public.assignments;
DROP POLICY IF EXISTS "Everyone can view assignments" ON public.assignments;
DROP POLICY IF EXISTS "Faculty can insert assignments" ON public.assignments;
DROP POLICY IF EXISTS "Creators can update assignments" ON public.assignments;
DROP POLICY IF EXISTS "Creators can delete assignments" ON public.assignments;

-- 3. READ: Allow ALL authenticated users (Students & Faculty) to VIEW assignments
CREATE POLICY "Authenticated users can view assignments"
ON public.assignments FOR SELECT
USING ( auth.role() = 'authenticated' );

-- 4. WRITE: Allow Faculty, HOD, and Admin to INSERT assignments
CREATE POLICY "Faculty can insert assignments"
ON public.assignments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('faculty', 'hod', 'admin')
  )
);

-- 5. UPDATE: Allow the creator (Faculty) to UPDATE their own assignments
CREATE POLICY "Creators can update assignments"
ON public.assignments FOR UPDATE
USING ( auth.uid() = creator_id );

-- 6. DELETE: Allow the creator (Faculty) to DELETE their own assignments
CREATE POLICY "Creators can delete assignments"
ON public.assignments FOR DELETE
USING ( auth.uid() = creator_id );

-- Grant access to the table for authenticated users
GRANT ALL ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;

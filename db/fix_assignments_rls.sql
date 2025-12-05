-- Fix RLS policies for Assignments and Submissions

-- Drop existing policies to avoid conflicts
drop policy if exists "Authenticated users can view assignments" on public.assignments;
drop policy if exists "Everyone can view assignments" on public.assignments;
drop policy if exists "Students can view their own submissions" on public.submissions;
drop policy if exists "Faculty can view all submissions" on public.submissions;

-- 1. Assignments: Allow all authenticated users to view assignments
create policy "Authenticated users can view assignments"
on public.assignments for select
using ( auth.role() = 'authenticated' );

-- 2. Submissions: Allow students to view their own submissions
create policy "Students can view their own submissions"
on public.submissions for select
using ( auth.uid() = student_id );

-- 3. Submissions: Allow faculty/hod/admin to view all submissions
create policy "Faculty can view all submissions"
on public.submissions for select
using ( 
  exists (
    select 1 from public.users 
    where id = auth.uid() 
    and role in ('faculty', 'hod', 'admin')
  )
);

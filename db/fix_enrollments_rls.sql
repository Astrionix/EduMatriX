-- Fix RLS policies for enrollments table

-- Ensure RLS is enabled
alter table public.enrollments enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Students can view their own enrollments" on public.enrollments;
drop policy if exists "Students can insert their own enrollments" on public.enrollments;
drop policy if exists "Students can delete their own enrollments" on public.enrollments;
drop policy if exists "Faculty and Admin can view all enrollments" on public.enrollments;

-- Students can view their own enrollments
create policy "Students can view their own enrollments" on public.enrollments
  for select using (auth.uid() = student_id);

-- Students can enroll themselves (insert)
create policy "Students can insert their own enrollments" on public.enrollments
  for insert with check (auth.uid() = student_id);

-- Students can unenroll themselves (delete)
create policy "Students can delete their own enrollments" on public.enrollments
  for delete using (auth.uid() = student_id);

-- Faculty and HOD/Admin can view all enrollments
create policy "Faculty and Admin can view all enrollments" on public.enrollments
  for select using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role in ('faculty', 'hod', 'admin')
    )
  );

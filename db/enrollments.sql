-- Create Enrollments table for Student-Subject mapping
create table if not exists public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.users(id),
  subject_id uuid references public.subjects(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, subject_id)
);

-- Enable RLS
alter table public.enrollments enable row level security;

-- Policies
create policy "Students can view their own enrollments" on public.enrollments
  for select using (auth.uid() = student_id);

create policy "Faculty and Admin can view all enrollments" on public.enrollments
  for select using (
    exists (
      select 1 from public.users where id = auth.uid() and role in ('faculty', 'hod', 'admin')
    )
  );

-- Insert demo data: Enroll all existing students to all existing subjects (for smooth transition)
insert into public.enrollments (student_id, subject_id)
select u.id, s.id
from public.users u
cross join public.subjects s
where u.role = 'student'
on conflict (student_id, subject_id) do nothing;

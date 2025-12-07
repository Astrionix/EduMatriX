-- Add semester_id to subjects table if not exists
alter table public.subjects 
add column if not exists semester_id uuid references public.semesters(id);

-- Enable RLS
alter table public.subjects enable row level security;

-- Drop existing policies
drop policy if exists "Anyone can view subjects" on public.subjects;
drop policy if exists "HOD can manage subjects" on public.subjects;

-- Everyone can view subjects
create policy "Anyone can view subjects" on public.subjects
    for select using (true);

-- HOD and Admin can insert, update, delete subjects
create policy "HOD can manage subjects" on public.subjects
    for all using (
        exists (
            select 1 from public.users 
            where id = auth.uid() and role in ('hod', 'admin')
        )
    );

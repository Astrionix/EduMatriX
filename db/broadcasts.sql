-- Create broadcasts table for HOD announcements
create table if not exists public.broadcasts (
    id uuid default uuid_generate_v4() primary key,
    sender_id uuid references public.users(id) on delete cascade,
    title text not null,
    message text not null,
    target_role text check (target_role in ('all', 'student', 'faculty')) default 'all',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.broadcasts enable row level security;

-- Drop existing policies
drop policy if exists "Anyone can view broadcasts" on public.broadcasts;
drop policy if exists "HOD and Admin can create broadcasts" on public.broadcasts;
drop policy if exists "HOD and Admin can delete broadcasts" on public.broadcasts;

-- Everyone can view broadcasts (client-side filters by role)
create policy "Anyone can view broadcasts" on public.broadcasts
    for select using (true);

-- Only HOD and Admin can create broadcasts
create policy "HOD and Admin can create broadcasts" on public.broadcasts
    for insert with check (
        exists (
            select 1 from public.users 
            where id = auth.uid() and role in ('hod', 'admin')
        )
    );

-- Only HOD and Admin can delete broadcasts
create policy "HOD and Admin can delete broadcasts" on public.broadcasts
    for delete using (
        exists (
            select 1 from public.users 
            where id = auth.uid() and role in ('hod', 'admin')
        )
    );

-- Enable realtime for broadcasts
alter publication supabase_realtime add table public.broadcasts;

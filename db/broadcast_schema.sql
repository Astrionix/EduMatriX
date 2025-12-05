-- Create broadcasts table
create table if not exists public.broadcasts (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.users(id),
  title text not null,
  message text not null,
  target_role text default 'all', -- 'all', 'student', 'faculty'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.broadcasts enable row level security;

-- Policies
-- HOD can insert
create policy "HOD can insert broadcasts" on public.broadcasts
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'hod')
  );

-- Everyone can view broadcasts targeting them or 'all'
create policy "Users can view relevant broadcasts" on public.broadcasts
  for select using (
    target_role = 'all' or 
    target_role = (select role from public.users where id = auth.uid())
  );

-- Enable Realtime
alter publication supabase_realtime add table public.broadcasts;

-- Create quiz_results table if not exists
create table if not exists public.quiz_results (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    topic text,
    score integer not null,
    total_questions integer not null,
    difficulty text default 'Medium',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.quiz_results enable row level security;

-- Drop existing policies
drop policy if exists "Users can view own quiz results" on public.quiz_results;
drop policy if exists "Users can insert own quiz results" on public.quiz_results;

-- Users can view their own quiz results
create policy "Users can view own quiz results" on public.quiz_results
    for select using (auth.uid() = user_id);

-- Users can insert their own quiz results
create policy "Users can insert own quiz results" on public.quiz_results
    for insert with check (auth.uid() = user_id);

-- Enable realtime for quiz_results
alter publication supabase_realtime add table public.quiz_results;

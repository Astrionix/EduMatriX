-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  role text check (role in ('student', 'faculty', 'hod', 'admin')) default 'student',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies for users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "HOD and Admin can view all profiles" on public.users
  for select using (
    exists (
      select 1 from public.users where id = auth.uid() and role in ('hod', 'admin')
    )
  );

-- Semesters table
create table public.semesters (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- e.g., "Semester 1", "Semester 2"
  start_date date,
  end_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subjects table
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text not null,
  semester_id uuid references public.semesters(id),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Faculty Subjects Mapping
create table public.faculty_subjects (
  id uuid default uuid_generate_v4() primary key,
  faculty_id uuid references public.users(id),
  subject_id uuid references public.subjects(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(faculty_id, subject_id)
);

-- Materials table
create table public.materials (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  file_url text not null,
  subject_id uuid references public.subjects(id),
  uploader_id uuid references public.users(id),
  version int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Assignments table
create table public.assignments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  subject_id uuid references public.subjects(id),
  creator_id uuid references public.users(id),
  due_date timestamp with time zone,
  file_url text, -- Reference material for assignment
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Submissions table
create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  assignment_id uuid references public.assignments(id),
  student_id uuid references public.users(id),
  file_url text not null,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  grade text,
  feedback text
);

-- Timetables table
create table public.timetables (
  id uuid default uuid_generate_v4() primary key,
  semester_id uuid references public.semesters(id),
  file_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  title text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Logs table
create table public.logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Simplified for brevity, but should be robust in production)
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.faculty_subjects enable row level security;
alter table public.materials enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.timetables enable row level security;
alter table public.notifications enable row level security;
alter table public.logs enable row level security;

-- Everyone can read semesters and subjects
create policy "Enable read access for all users" on public.semesters for select using (true);
create policy "Enable read access for all users" on public.subjects for select using (true);

-- Faculty can insert materials
create policy "Faculty can insert materials" on public.materials for insert with check (
  exists (select 1 from public.users where id = auth.uid() and role in ('faculty', 'hod', 'admin'))
);

-- Students can view materials
create policy "Students can view materials" on public.materials for select using (true);

-- Trigger to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'student'); -- Default to student, HOD approves/changes later
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

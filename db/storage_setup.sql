-- Create storage buckets
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('assignments', 'assignments', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false) -- Submissions should probably be private
on conflict (id) do nothing;

-- Drop existing policies to avoid errors on re-run
drop policy if exists "Materials are publicly accessible" on storage.objects;
drop policy if exists "Authenticated users can upload materials" on storage.objects;
drop policy if exists "Users can update their own materials" on storage.objects;
drop policy if exists "Users can delete their own materials" on storage.objects;
drop policy if exists "Assignments are publicly accessible" on storage.objects;
drop policy if exists "Authenticated users can upload assignments" on storage.objects;
drop policy if exists "Students can upload submissions" on storage.objects;
drop policy if exists "Students can view their own submissions" on storage.objects;
drop policy if exists "Faculty can view all submissions" on storage.objects;

-- Set up security policies for 'materials'
create policy "Materials are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'materials' );

create policy "Authenticated users can upload materials"
  on storage.objects for insert
  with check ( bucket_id = 'materials' and auth.role() = 'authenticated' );

create policy "Users can update their own materials"
  on storage.objects for update
  using ( bucket_id = 'materials' and auth.uid() = owner );

create policy "Users can delete their own materials"
  on storage.objects for delete
  using ( bucket_id = 'materials' and auth.uid() = owner );

-- Set up security policies for 'assignments'
create policy "Assignments are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'assignments' );

create policy "Authenticated users can upload assignments"
  on storage.objects for insert
  with check ( bucket_id = 'assignments' and auth.role() = 'authenticated' );

-- Set up security policies for 'submissions'
create policy "Students can upload submissions"
  on storage.objects for insert
  with check ( bucket_id = 'submissions' and auth.role() = 'authenticated' );

create policy "Students can view their own submissions"
  on storage.objects for select
  using ( bucket_id = 'submissions' and auth.uid() = owner );

create policy "Faculty can view all submissions"
  on storage.objects for select
  using ( bucket_id = 'submissions' and exists (
    select 1 from public.users where id = auth.uid() and role in ('faculty', 'hod', 'admin')
  ));

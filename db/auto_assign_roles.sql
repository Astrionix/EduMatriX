-- This trigger automatically creates/updates the users table
-- with the role selected during registration

-- First, update the handle_new_user function to use the role from auth metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.users (id, email, full_name, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', 'Unknown'),
        coalesce(new.raw_user_meta_data->>'role', 'student')
    )
    on conflict (id) do update set
        email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role;
    return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it exists and recreate it
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Also fix existing users - update their roles from auth metadata
update public.users u
set role = coalesce(
    (select raw_user_meta_data->>'role' from auth.users where id = u.id),
    'student'
);

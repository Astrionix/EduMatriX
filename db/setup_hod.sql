-- 1. Improved function to promote a user to HOD
create or replace function public.promote_to_hod(target_email text)
returns text
language plpgsql
security definer
as $$
declare
  user_exists boolean;
begin
  select exists(select 1 from auth.users where email = target_email) into user_exists;
  
  if user_exists then
    -- Update public profile
    update public.users
    set role = 'hod'
    where email = target_email;

    -- Update auth metadata (crucial for session claims)
    update auth.users
    set raw_user_meta_data = 
      case 
        when raw_user_meta_data is null then '{"role": "hod"}'::jsonb
        else jsonb_set(raw_user_meta_data, '{role}', '"hod"')
      end
    where email = target_email;
    
    return 'User ' || target_email || ' promoted to HOD successfully.';
  else
    return 'User ' || target_email || ' not found. Please register them first.';
  end if;
end;
$$;

-- 2. Usage:
-- First, go to your app's Register page and create an account with:
-- Email: hod@mca.edu
-- Password: password123 (or anything you like)

-- Then, uncomment and run the line below in the Supabase SQL Editor:
-- select public.promote_to_hod('hod@mca.edu');

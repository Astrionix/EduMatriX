-- Use this script if you have already created the user but forgot the password
-- or if you want to force-set the password to 'password123'

-- 1. Enable pgcrypto extension (required for password hashing)
create extension if not exists pgcrypto;

-- 2. Force update the password for hod@mca.edu
update auth.users
set encrypted_password = crypt('password123', gen_salt('bf'))
where email = 'hod@mca.edu';

-- 3. Confirm the update
select email, role, last_sign_in_at from auth.users where email = 'hod@mca.edu';

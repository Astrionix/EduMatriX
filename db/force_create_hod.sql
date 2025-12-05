-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  v_user_exists boolean;
  v_user_id uuid;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'hod@mca.edu') INTO v_user_exists;

  IF v_user_exists THEN
    -- Get existing user id
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'hod@mca.edu';

    -- User exists: Update password and role
    UPDATE auth.users
    SET encrypted_password = crypt('password123', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{role}',
            '"hod"'
        )
    WHERE email = 'hod@mca.edu';
    
    -- Update public profile
    INSERT INTO public.users (id, email, role, full_name)
    VALUES (v_user_id, 'hod@mca.edu', 'hod', 'Head of Department')
    ON CONFLICT (id) DO UPDATE
    SET role = 'hod',
        full_name = 'Head of Department';
    
    RAISE NOTICE 'User hod@mca.edu updated.';
    
  ELSE
    -- User does not exist: Create new user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'hod@mca.edu',
      crypt('password123', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"role": "hod", "full_name": "Head of Department"}',
      now(),
      now()
    );
    
    -- Manually insert into public.users to ensure it exists and has correct role
    INSERT INTO public.users (id, email, role, full_name)
    VALUES (new_user_id, 'hod@mca.edu', 'hod', 'Head of Department')
    ON CONFLICT (id) DO UPDATE
    SET role = 'hod';
    
    RAISE NOTICE 'User hod@mca.edu created.';
  END IF;
END $$;

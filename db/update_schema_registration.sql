-- 1. Add new columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS usn text,
ADD COLUMN IF NOT EXISTS semester text,
ADD COLUMN IF NOT EXISTS section text;

-- 2. Update the handle_new_user function to map metadata to columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, usn, semester, section)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'student'), -- Default to student if not provided
    new.raw_user_meta_data->>'usn',
    new.raw_user_meta_data->>'semester',
    new.raw_user_meta_data->>'section'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a function to promote a user to HOD (to be used manually)
CREATE OR REPLACE FUNCTION public.promote_to_hod(user_email text)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET role = 'hod'
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

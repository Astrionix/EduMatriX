-- 1. Create Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid REFERENCES public.users(id),
  subject_id uuid REFERENCES public.subjects(id),
  faculty_id uuid REFERENCES public.users(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text CHECK (status IN ('present', 'absent', 'late', 'excused')) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, subject_id, date)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Faculty can manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('faculty', 'hod'))
  );

CREATE POLICY "Students can view their own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = student_id);

-- 2. Create Broadcasts Table (for HOD announcements)
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id uuid REFERENCES public.users(id),
  title text NOT NULL,
  message text NOT NULL,
  target_role text CHECK (target_role IN ('all', 'student', 'faculty')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read broadcasts" ON public.broadcasts FOR SELECT USING (true);

CREATE POLICY "HOD can create broadcasts" ON public.broadcasts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'hod')
  );

-- 3. Function to create notification on broadcast
CREATE OR REPLACE FUNCTION public.handle_new_broadcast()
RETURNS TRIGGER AS $$
DECLARE
  target_user RECORD;
BEGIN
  FOR target_user IN 
    SELECT id FROM public.users 
    WHERE (NEW.target_role = 'all') 
       OR (role = NEW.target_role)
  LOOP
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (target_user.id, NEW.title, NEW.message);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_broadcast_created
  AFTER INSERT ON public.broadcasts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_broadcast();

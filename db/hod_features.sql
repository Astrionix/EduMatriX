-- 1. Add status column to users for approval workflow
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'active', 'rejected')) DEFAULT 'pending';

-- Update existing users to active so they aren't locked out
UPDATE public.users SET status = 'active' WHERE status IS NULL;

-- 2. Create quiz_results table for analytics
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  subject_id uuid REFERENCES public.subjects(id),
  score int,
  total_questions int,
  difficulty text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for quiz_results
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies for quiz_results
CREATE POLICY "Users can view their own quiz results" ON public.quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quiz results" ON public.quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "HOD and Faculty can view all quiz results" ON public.quiz_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('hod', 'faculty'))
);

-- 3. Create 'timetables' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('timetables', 'timetables', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for timetables bucket
CREATE POLICY "Timetables are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'timetables' );

CREATE POLICY "HOD can upload timetables"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'timetables' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'hod') );

CREATE POLICY "HOD can update timetables"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'timetables' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'hod') );

CREATE POLICY "HOD can delete timetables"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'timetables' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'hod') );

-- 4. Policy for HOD to manage timetables table
CREATE POLICY "HOD can manage timetables table" ON public.timetables FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'hod')
);

-- 5. Policy for HOD to update user status
CREATE POLICY "HOD can update user status" ON public.users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'hod')
);

-- 6. Trigger to auto-approve HOD (optional, but good for safety)
CREATE OR REPLACE FUNCTION public.auto_approve_hod()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'hod' THEN
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created_approve_hod
  BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_approve_hod();

-- 1. Discussion Forums Table
CREATE TABLE IF NOT EXISTS public.discussions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id uuid REFERENCES public.subjects(id),
  user_id uuid REFERENCES public.users(id),
  title text NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES public.discussions(id), -- For replies
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read discussions" ON public.discussions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post discussions" ON public.discussions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Lesson Plans Table (for Faculty)
CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  faculty_id uuid REFERENCES public.users(id),
  subject_id uuid REFERENCES public.subjects(id),
  topic text NOT NULL,
  content jsonb NOT NULL, -- Structured plan
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can manage their lesson plans" ON public.lesson_plans
  FOR ALL USING (auth.uid() = faculty_id);

-- 3. Update Submissions to support star ratings (if not exists)
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS rating int CHECK (rating >= 1 AND rating <= 5);

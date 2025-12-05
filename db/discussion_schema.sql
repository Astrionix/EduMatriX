-- Create Discussions Table
CREATE TABLE IF NOT EXISTS public.discussions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view discussions" ON public.discussions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post discussions" ON public.discussions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussions;

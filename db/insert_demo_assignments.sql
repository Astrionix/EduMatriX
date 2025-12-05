-- Insert demo assignments
INSERT INTO public.assignments (id, title, description, subject_id, due_date)
VALUES 
  (
    'a1111111-1111-4111-8111-111111111111', 
    'Data Structures Lab Record', 
    'Submit the complete lab record for all experiments conducted so far.', 
    '11111111-1111-4111-8111-111111111111', -- MCA101
    NOW() + INTERVAL '7 days'
  ),
  (
    'a2222222-2222-4222-8222-222222222222', 
    'SQL Queries Assignment', 
    'Write complex SQL queries for the given schema.', 
    '22222222-2222-4222-8222-222222222222', -- MCA102
    NOW() + INTERVAL '3 days'
  ),
  (
    'a3333333-3333-4333-8333-333333333333', 
    'Cloud Architecture Case Study', 
    'Analyze the cloud architecture of Netflix.', 
    '88888888-8888-4888-8888-888888888888', -- MCA203
    NOW() + INTERVAL '14 days'
  )
ON CONFLICT (id) DO NOTHING;

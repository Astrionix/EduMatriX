-- Insert demo subjects to satisfy foreign key constraints
INSERT INTO public.subjects (id, name, code, description)
VALUES 
  ('11111111-1111-4111-8111-111111111111', 'Data Structures and Algorithms', 'MCA101', 'Fundamental data structures and algorithms.'),
  ('22222222-2222-4222-8222-222222222222', 'Database Management Systems', 'MCA102', 'Relational database design and SQL.'),
  ('33333333-3333-4333-8333-333333333333', 'Operating Systems', 'MCA103', 'Process management, memory management, and file systems.'),
  ('44444444-4444-4444-8444-444444444444', 'Computer Networks', 'MCA104', 'Network protocols, layers, and security.'),
  ('55555555-5555-4555-8555-555555555555', 'Web Technologies', 'MCA105', 'HTML, CSS, JavaScript, and backend development.'),
  ('66666666-6666-4666-8666-666666666666', 'Artificial Intelligence', 'MCA201', 'AI concepts, machine learning, and neural networks.'),
  ('77777777-7777-4777-8777-777777777777', 'Software Engineering', 'MCA202', 'SDLC, agile methodologies, and project management.'),
  ('88888888-8888-4888-8888-888888888888', 'Cloud Computing', 'MCA203', 'Cloud services, virtualization, and deployment.')
ON CONFLICT (id) DO NOTHING;

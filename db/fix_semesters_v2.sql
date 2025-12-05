-- Ensure Semesters 1-4 exist (Safe Insert)
INSERT INTO public.semesters (name)
SELECT 'Semester 1' WHERE NOT EXISTS (SELECT 1 FROM public.semesters WHERE name = 'Semester 1');

INSERT INTO public.semesters (name)
SELECT 'Semester 2' WHERE NOT EXISTS (SELECT 1 FROM public.semesters WHERE name = 'Semester 2');

INSERT INTO public.semesters (name)
SELECT 'Semester 3' WHERE NOT EXISTS (SELECT 1 FROM public.semesters WHERE name = 'Semester 3');

INSERT INTO public.semesters (name)
SELECT 'Semester 4' WHERE NOT EXISTS (SELECT 1 FROM public.semesters WHERE name = 'Semester 4');

-- Verify they exist
SELECT * FROM public.semesters WHERE name IN ('Semester 1', 'Semester 2', 'Semester 3', 'Semester 4');

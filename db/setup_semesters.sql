-- Insert Semesters 1 to 4 if they don't exist
INSERT INTO public.semesters (name)
SELECT 'Semester ' || s
FROM generate_series(1, 4) s
WHERE NOT EXISTS (
    SELECT 1 FROM public.semesters WHERE name = 'Semester ' || s
);

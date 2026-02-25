ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'jobs'
      AND policyname = 'Public can create jobs'
  ) THEN
    CREATE POLICY "Public can create jobs"
      ON public.jobs
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'applications'
      AND policyname = 'Public can submit applications'
  ) THEN
    CREATE POLICY "Public can submit applications"
      ON public.applications
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END
$$;

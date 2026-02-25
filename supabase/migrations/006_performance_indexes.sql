DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'location_city'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'location_state'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_jobs_location_city_state ON public.jobs(location_city, location_state);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'status'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_installers_location ON public.installers(location);
CREATE INDEX IF NOT EXISTS idx_installers_created_at ON public.installers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);

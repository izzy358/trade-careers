CREATE INDEX IF NOT EXISTS idx_jobs_location_city_state ON public.jobs(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_installers_location ON public.installers(location);
CREATE INDEX IF NOT EXISTS idx_installers_created_at ON public.installers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);

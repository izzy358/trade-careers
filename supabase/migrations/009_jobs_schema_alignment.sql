ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS location_city text,
  ADD COLUMN IF NOT EXISTS location_state text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS job_type text,
  ADD COLUMN IF NOT EXISTS pay_min numeric,
  ADD COLUMN IF NOT EXISTS pay_max numeric,
  ADD COLUMN IF NOT EXISTS pay_type text,
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS trades text[],
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS company_email text,
  ADD COLUMN IF NOT EXISTS company_logo_url text,
  ADD COLUMN IF NOT EXISTS how_to_apply text,
  ADD COLUMN IF NOT EXISTS manage_token text;

ALTER TABLE public.jobs
  ALTER COLUMN company DROP NOT NULL,
  ALTER COLUMN location DROP NOT NULL;

UPDATE public.jobs
SET company_name = company
WHERE company_name IS NULL
  AND company IS NOT NULL;

UPDATE public.jobs
SET location_city = NULLIF(BTRIM(SPLIT_PART(location, ',', 1)), '')
WHERE location_city IS NULL
  AND location IS NOT NULL;

UPDATE public.jobs
SET location_state = NULLIF(UPPER(LEFT(BTRIM(SPLIT_PART(location, ',', 2)), 2)), '')
WHERE location_state IS NULL
  AND location IS NOT NULL
  AND POSITION(',' IN location) > 0;

UPDATE public.jobs
SET company = company_name
WHERE company IS NULL
  AND company_name IS NOT NULL;

UPDATE public.jobs
SET location = CONCAT_WS(', ', location_city, location_state)
WHERE location IS NULL
  AND (location_city IS NOT NULL OR location_state IS NOT NULL);

UPDATE public.jobs
SET slug = LOWER(
  REGEXP_REPLACE(COALESCE(title, 'job'), '[^a-zA-Z0-9]+', '-', 'g')
) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

UPDATE public.jobs
SET is_featured = false
WHERE is_featured IS NULL;

UPDATE public.jobs
SET status = 'active'
WHERE status IS NULL OR status = '';

UPDATE public.jobs
SET status = 'draft'
WHERE status NOT IN ('active', 'closed', 'draft');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'jobs_slug_key'
      AND conrelid = 'public.jobs'::regclass
  ) THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_slug_key UNIQUE (slug);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'jobs_status_check'
      AND conrelid = 'public.jobs'::regclass
  ) THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_status_check CHECK (status IN ('active', 'closed', 'draft'));
  END IF;
END
$$;

ALTER TABLE public.jobs
  ALTER COLUMN is_featured SET DEFAULT false,
  ALTER COLUMN status SET DEFAULT 'active';

DROP POLICY IF EXISTS "Public can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public can submit applications" ON public.applications;
DROP POLICY IF EXISTS "Anyone can create an installer profile." ON public.installers;
DROP POLICY IF EXISTS "Public can create installer profiles" ON public.installers;


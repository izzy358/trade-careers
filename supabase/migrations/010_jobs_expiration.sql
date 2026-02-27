ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

UPDATE public.jobs
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;

ALTER TABLE public.jobs
  ALTER COLUMN expires_at SET DEFAULT (created_at + INTERVAL '30 days');

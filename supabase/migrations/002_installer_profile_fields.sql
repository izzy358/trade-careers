ALTER TABLE public.installers
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS manage_token text,
  ADD COLUMN IF NOT EXISTS portfolio_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

ALTER TABLE public.installers
  ALTER COLUMN bio SET DEFAULT '';

UPDATE public.installers
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS installers_slug_key ON public.installers(slug);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'installers'
      AND policyname = 'Public can create installer profiles'
  ) THEN
    CREATE POLICY "Public can create installer profiles"
      ON public.installers
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
      AND tablename = 'installers'
      AND policyname = 'Public can update installer profile by token'
  ) THEN
    CREATE POLICY "Public can update installer profile by token"
      ON public.installers
      FOR UPDATE
      TO anon
      USING (manage_token IS NOT NULL)
      WITH CHECK (manage_token IS NOT NULL);
  END IF;
END
$$;

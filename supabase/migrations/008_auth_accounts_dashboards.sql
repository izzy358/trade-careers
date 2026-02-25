-- Auth profiles for account routing
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  account_type text NOT NULL CHECK (account_type IN ('installer', 'employer')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- Installer linkage + profile picture support
ALTER TABLE public.installers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_installers_user ON public.installers(user_id);
ALTER TABLE public.installers ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.installers ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'installers' AND policyname = 'Installers can insert own profile'
  ) THEN
    CREATE POLICY "Installers can insert own profile"
      ON public.installers
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'installers' AND policyname = 'Installers can update own profile'
  ) THEN
    CREATE POLICY "Installers can update own profile"
      ON public.installers
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'installers' AND policyname = 'Installers can view own profile'
  ) THEN
    CREATE POLICY "Installers can view own profile"
      ON public.installers
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Employers and job ownership
CREATE TABLE IF NOT EXISTS public.employers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  company_name text NOT NULL,
  company_email text,
  location text,
  website text,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'employers' AND policyname = 'Employers can read own'
  ) THEN
    CREATE POLICY "Employers can read own" ON public.employers FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'employers' AND policyname = 'Employers can update own'
  ) THEN
    CREATE POLICY "Employers can update own" ON public.employers FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'employers' AND policyname = 'Employers can insert own'
  ) THEN
    CREATE POLICY "Employers can insert own" ON public.employers FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'employers' AND policyname = 'Public can view employers'
  ) THEN
    CREATE POLICY "Public can view employers" ON public.employers FOR SELECT USING (true);
  END IF;
END
$$;

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employer_id uuid REFERENCES public.employers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON public.jobs(employer_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'jobs' AND policyname = 'Employers can insert own jobs'
  ) THEN
    CREATE POLICY "Employers can insert own jobs"
      ON public.jobs
      FOR INSERT
      TO authenticated
      WITH CHECK (
        employer_id IN (
          SELECT id FROM public.employers WHERE user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'jobs' AND policyname = 'Employers can update own jobs'
  ) THEN
    CREATE POLICY "Employers can update own jobs"
      ON public.jobs
      FOR UPDATE
      TO authenticated
      USING (
        employer_id IN (
          SELECT id FROM public.employers WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        employer_id IN (
          SELECT id FROM public.employers WHERE user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'jobs' AND policyname = 'Employers can read own jobs'
  ) THEN
    CREATE POLICY "Employers can read own jobs"
      ON public.jobs
      FOR SELECT
      TO authenticated
      USING (
        employer_id IN (
          SELECT id FROM public.employers WHERE user_id = auth.uid()
        )
      );
  END IF;
END
$$;

-- Optional linkage for installer application dashboard
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'applications' AND policyname = 'Users can view own applications'
  ) THEN
    CREATE POLICY "Users can view own applications"
      ON public.applications
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Avatars storage bucket + policies
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view avatars'
  ) THEN
    CREATE POLICY "Public can view avatars"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload avatars'
  ) THEN
    CREATE POLICY "Authenticated users can upload avatars"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own avatars'
  ) THEN
    CREATE POLICY "Users can update own avatars"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
      )
      WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own avatars'
  ) THEN
    CREATE POLICY "Users can delete own avatars"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END
$$;

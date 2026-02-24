
CREATE TABLE public.jobs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  CONSTRAINT jobs_pkey PRIMARY KEY (id)
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public jobs are viewable by everyone." ON public.jobs FOR SELECT USING (true);

CREATE TABLE public.applications (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  job_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  resume_url text NOT NULL,
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applications are viewable by authenticated users." ON public.applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own applications." ON public.applications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE public.installers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  name text NOT NULL,
  location text NOT NULL,
  specialties text[] NOT NULL,
  bio text,
  CONSTRAINT installers_pkey PRIMARY KEY (id)
);

ALTER TABLE public.installers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public installers are viewable by everyone." ON public.installers FOR SELECT USING (true);

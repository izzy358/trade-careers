import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSessionContext } from '@/utils/auth';
import { EmployerDashboardClient } from '@/components/dashboard/EmployerDashboardClient';

type Employer = {
  id: string;
  company_name: string;
  company_email: string | null;
  location: string | null;
  website: string | null;
  logo_url: string | null;
};

type Job = {
  id: string;
  title: string;
  slug: string;
  status: string;
  location_city: string;
  location_state: string;
  created_at: string;
  expires_at: string | null;
};

type Application = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  jobs: {
    id: string;
    title: string;
    slug: string;
  } | null;
};

export default async function EmployerDashboardPage() {
  const session = await getSessionContext();
  if (!session) {
    redirect('/login?redirect=/dashboard/employer');
  }
  if (session.accountType !== 'employer') {
    redirect('/dashboard');
  }

  const supabase = await createClient();
  const { data: employer } = await supabase
    .from('employers')
    .select('id, company_name, company_email, location, website, logo_url')
    .eq('user_id', session.user.id)
    .maybeSingle();

  let jobs: Job[] = [];
  let applications: Application[] = [];

  if (employer?.id) {
    const [{ data: jobsData }, { data: appData }] = await Promise.all([
      supabase
        .from('jobs')
        .select('id, title, slug, status, location_city, location_state, created_at, expires_at')
        .eq('employer_id', employer.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('id, created_at, name, email, phone, message, jobs!inner(id, title, slug)')
        .eq('jobs.employer_id', employer.id)
        .order('created_at', { ascending: false }),
    ]);

    jobs = (jobsData as Job[] | null) ?? [];
    applications = (appData as Application[] | null) ?? [];
  }

  return (
    <EmployerDashboardClient
      userEmail={session.user.email}
      initialEmployer={(employer as Employer | null) ?? null}
      initialJobs={jobs}
      applications={applications}
    />
  );
}

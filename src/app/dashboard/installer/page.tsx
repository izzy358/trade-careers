import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSessionContext } from '@/utils/auth';
import { InstallerDashboardClient } from '@/components/dashboard/InstallerDashboardClient';

type Installer = {
  id: string;
  name: string;
  location: string;
  specialties: string[];
  bio: string | null;
  years_experience: number | null;
  is_available: boolean | null;
  instagram: string | null;
  tiktok: string | null;
  website: string | null;
  youtube: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  slug: string | null;
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
    company_name: string;
    location_city: string;
    location_state: string;
  } | null;
};

export default async function InstallerDashboardPage() {
  const session = await getSessionContext();
  if (!session) {
    redirect('/login?redirect=/dashboard/installer');
  }
  if (session.accountType !== 'installer') {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  const [{ data: installer }, { data: applications }] = await Promise.all([
    supabase
      .from('installers')
      .select('id, name, location, specialties, bio, years_experience, is_available, instagram, tiktok, website, youtube, phone, email, avatar_url, slug')
      .eq('user_id', session.user.id)
      .maybeSingle(),
    supabase
      .from('applications')
      .select('id, created_at, name, email, phone, message, jobs:job_id (id, title, slug, company_name, location_city, location_state)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false }),
  ]);

  return (
    <InstallerDashboardClient
      userId={session.user.id}
      userEmail={session.user.email}
      initialInstaller={(installer as Installer | null) ?? null}
      applications={(applications as Application[] | null) ?? []}
    />
  );
}

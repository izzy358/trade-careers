import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { tradeColors, tradeLabel } from '@/utils/constants';

type InstallerProfilePageProps = {
  params: Promise<{ id: string }>;
};

async function getInstaller(slug: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('installers')
    .select('*')
    .eq('slug', slug)
    .single();

  return data;
}

export async function generateMetadata({ params }: InstallerProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const installer = await getInstaller(id);

  if (!installer) {
    return { title: 'Installer Not Found | WrapCareers' };
  }

  return {
    title: `${installer.name} | Installer Profile | WrapCareers`,
    description: `${installer.name} in ${installer.location}. Specialties: ${(installer.specialties || []).map(tradeLabel).join(', ')}`,
  };
}

export default async function InstallerProfilePage({ params }: InstallerProfilePageProps) {
  const { id } = await params;
  const installer = await getInstaller(id);

  if (!installer) {
    return (
      <div className="p-8 rounded-xl bg-surface border border-border text-center">
        <h1 className="text-3xl font-bold mb-3">Installer not found</h1>
        <p className="text-text-secondary mb-4">This profile may have been removed.</p>
        <Link href="/installers" className="text-primary hover:underline">Back to installer directory</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-surface border border-border rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{installer.name}</h1>
            <p className="text-text-secondary">{installer.location}</p>
          </div>
          {installer.is_available ? (
            <span className="text-sm px-3 py-1 rounded-full bg-success/20 text-success h-fit">Open to work</span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 my-5">
          {(installer.specialties || []).map((specialty: string) => (
            <span key={specialty} className={`text-sm px-3 py-1 rounded-full ${tradeColors[specialty] || 'bg-gray-700 text-gray-300'}`}>
              {tradeLabel(specialty)}
            </span>
          ))}
        </div>

        {installer.years_experience ? (
          <p className="text-text-secondary mb-4">Experience: {installer.years_experience}+ years</p>
        ) : null}

        <section>
          <h2 className="text-2xl font-semibold mb-3">About</h2>
          <p className="text-text-secondary whitespace-pre-wrap">{installer.bio || 'No bio provided.'}</p>
        </section>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-3">Portfolio</h2>
        {installer.portfolio_urls && installer.portfolio_urls.length > 0 ? (
          <ul className="space-y-2">
            {installer.portfolio_urls.map((url: string) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary">No portfolio links added yet.</p>
        )}
      </div>
    </div>
  );
}

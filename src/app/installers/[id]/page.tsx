import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { tradeColors, tradeLabel } from '@/utils/constants';

type InstallerProfilePageProps = {
  params: Promise<{ id: string }>;
};

type Installer = {
  id: string;
  name: string;
  location: string;
  specialties: string[] | null;
  bio: string | null;
  years_experience?: number | null;
  is_available?: boolean | null;
  instagram?: string | null;
  tiktok?: string | null;
  website?: string | null;
  youtube?: string | null;
  phone?: string | null;
  email?: string | null;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeSocialValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function toSocialHref(value: string, type: 'instagram' | 'tiktok' | 'website' | 'youtube' | 'phone' | 'email') {
  const trimmed = value.trim();

  if (type === 'phone') {
    return `tel:${trimmed}`;
  }
  if (type === 'email') {
    return `mailto:${trimmed}`;
  }
  if (type === 'website') {
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }
  if (type === 'instagram') {
    return /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://instagram.com/${trimmed.replace(/^@/, '')}`;
  }
  if (type === 'tiktok') {
    return /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://tiktok.com/@${trimmed.replace(/^@/, '')}`;
  }

  return /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://youtube.com/${trimmed.replace(/^@/, '@')}`;
}

function SocialIcon({ label }: { label: string }) {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-[11px] font-bold text-primary">
      {label}
    </span>
  );
}

async function getInstaller(id: string): Promise<Installer | null> {
  if (!UUID_PATTERN.test(id)) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from('installers').select('*').eq('id', id).single();
  return (data as Installer | null) || null;
}

export async function generateMetadata({ params }: InstallerProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const installer = await getInstaller(id);

  if (!installer) {
    return {
      title: 'Installer Not Found',
      description: 'The requested installer profile does not exist.',
    };
  }

  return {
    title: `${installer.name} Installer Profile`,
    description: `${installer.name} in ${installer.location}. Specialties: ${(installer.specialties || []).map(tradeLabel).join(', ') || 'General automotive trades'}`,
  };
}

export default async function InstallerProfilePage({ params }: InstallerProfilePageProps) {
  const { id } = await params;
  const installer = await getInstaller(id);

  if (!installer) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-8 text-center">
        <h1 className="mb-3 text-3xl font-bold">Installer not found</h1>
        <p className="mb-4 text-text-secondary">This profile may have been removed.</p>
        <Link href="/installers" className="text-primary hover:underline">Back to installer directory</Link>
      </div>
    );
  }

  const socials = [
    { key: 'instagram', label: 'Instagram', short: 'IG', value: normalizeSocialValue(installer.instagram) },
    { key: 'tiktok', label: 'TikTok', short: 'TT', value: normalizeSocialValue(installer.tiktok) },
    { key: 'website', label: 'Website', short: 'Web', value: normalizeSocialValue(installer.website) },
    { key: 'youtube', label: 'YouTube', short: 'YT', value: normalizeSocialValue(installer.youtube) },
    { key: 'phone', label: 'Phone', short: 'P', value: normalizeSocialValue(installer.phone) },
    { key: 'email', label: 'Email', short: 'E', value: normalizeSocialValue(installer.email) },
  ] as const;

  const availableSocials = socials.filter((item) => Boolean(item.value));

  return (
    <div className="mx-auto max-w-5xl">
      <section className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">{installer.name}</h1>
            <p className="text-text-secondary">{installer.location}</p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Message Installer
          </button>
        </div>

        {(installer.specialties || []).length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {(installer.specialties || []).map((specialty) => (
              <span
                key={specialty}
                className={`rounded-full px-3 py-1 text-sm font-medium ${tradeColors[specialty] || 'bg-gray-700 text-gray-300'}`}
              >
                {tradeLabel(specialty)}
              </span>
            ))}
          </div>
        ) : null}

        {installer.is_available ? (
          <p className="mb-4 text-sm font-medium text-success">Open to work</p>
        ) : null}

        {installer.years_experience ? (
          <p className="mb-4 text-text-secondary">Experience: {installer.years_experience}+ years</p>
        ) : null}

        <h2 className="mb-3 text-2xl font-semibold text-white">Bio</h2>
        <p className="whitespace-pre-wrap text-text-secondary">{installer.bio || 'No bio provided yet.'}</p>

        {availableSocials.length > 0 ? (
          <div className="mt-8 rounded-xl border border-primary/40 bg-background/70 p-5">
            <h2 className="mb-4 text-xl font-semibold text-white">Socials</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {availableSocials.map((item) => (
                <a
                  key={item.key}
                  href={toSocialHref(item.value as string, item.key)}
                  target={item.key === 'phone' || item.key === 'email' ? undefined : '_blank'}
                  rel={item.key === 'phone' || item.key === 'email' ? undefined : 'noreferrer'}
                  className="inline-flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:text-white"
                >
                  <SocialIcon label={item.short} />
                  <span className="font-medium text-white">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

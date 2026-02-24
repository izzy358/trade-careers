import Link from 'next/link';
import type { Metadata } from 'next';
import { getInstallers } from '@/utils/data';
import { TRADES, tradeColors, tradeLabel } from '@/utils/constants';

type InstallerListItem = {
  id: string;
  name: string;
  location: string;
  specialties: string[];
  bio: string | null;
  years_experience?: number | null;
  is_available?: boolean | null;
  instagram?: string | null;
  tiktok?: string | null;
  website?: string | null;
  youtube?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at: string;
};

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

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://youtube.com/${trimmed}`;
}

function SocialIcon({ label }: { label: string }) {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-[10px] font-bold text-primary">
      {label}
    </span>
  );
}

type InstallersPageProps = {
  searchParams: Promise<{
    q?: string;
    location?: string;
    specialty?: string;
    availability?: string;
    sort?: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Installer Directory',
  description: 'Browse installer profiles by location and specialty for wrap, tint, PPF, and detailing trades.',
};

export default async function InstallersPage({ searchParams }: InstallersPageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || '';
  const location = resolvedParams?.location || '';
  const specialty = resolvedParams?.specialty || '';
  const availability = resolvedParams?.availability === 'true';
  const sort = resolvedParams?.sort || 'newest';

  const { installers, error } = await getInstallers({
    q,
    location,
    specialty,
    availability,
    sort,
    limit: 24,
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Installer Directory</h1>
          <p className="text-text-secondary">Search installers by city/state and specialty.</p>
        </div>
        <Link
          href="/installers/register"
          className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors text-center"
        >
          Create Installer Profile
        </Link>
      </header>

      <form className="bg-surface border border-border rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Name or keyword"
          className="p-3 rounded-lg bg-background border border-border text-text-primary"
        />
        <input
          type="text"
          name="location"
          defaultValue={location}
          placeholder="City or state"
          className="p-3 rounded-lg bg-background border border-border text-text-primary"
        />
        <select
          name="specialty"
          defaultValue={specialty}
          className="p-3 rounded-lg bg-background border border-border text-text-primary"
        >
          <option value="">All specialties</option>
          {TRADES.map((trade) => (
            <option key={trade.value} value={trade.value}>{trade.label}</option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="p-3 rounded-lg bg-background border border-border text-text-primary"
        >
          <option value="newest">Newest</option>
          <option value="experience-desc">Most experience</option>
          <option value="name-asc">Name A-Z</option>
        </select>

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-3 rounded-lg border border-border bg-background text-sm flex-1">
            <input type="checkbox" name="availability" value="true" defaultChecked={availability} />
            Open to work
          </label>
          <button
            type="submit"
            className="px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <p className="text-text-secondary">{installers.length} installers found</p>

      {error ? (
        <div className="p-6 rounded-xl bg-surface border border-error text-error">
          Failed to load installer profiles: {error}
        </div>
      ) : installers.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface border border-border text-center text-text-secondary">
          No installer profiles match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {installers.map((installer: InstallerListItem) => (
            <article key={installer.id} className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <Link href={`/installers/${installer.id}`} className="text-xl font-semibold hover:text-primary transition-colors">
                    {installer.name}
                  </Link>
                  <p className="text-text-secondary text-sm">{installer.location}</p>
                </div>
                {installer.is_available ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">Open to Work</span>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {installer.specialties.map((specialtyValue) => (
                  <span
                    key={specialtyValue}
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${tradeColors[specialtyValue] || 'bg-gray-700 text-gray-300'}`}
                  >
                    {tradeLabel(specialtyValue)}
                  </span>
                ))}
              </div>

              {installer.years_experience ? (
                <p className="text-sm text-text-secondary mb-2">{installer.years_experience}+ years experience</p>
              ) : null}

              <p className="text-text-secondary text-sm line-clamp-3">{installer.bio || 'No bio added yet.'}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { key: 'instagram', short: 'IG', value: normalizeSocialValue(installer.instagram) },
                  { key: 'tiktok', short: 'TT', value: normalizeSocialValue(installer.tiktok) },
                  { key: 'website', short: 'Web', value: normalizeSocialValue(installer.website) },
                  { key: 'youtube', short: 'YT', value: normalizeSocialValue(installer.youtube) },
                  { key: 'phone', short: 'P', value: normalizeSocialValue(installer.phone) },
                  { key: 'email', short: 'E', value: normalizeSocialValue(installer.email) },
                ].map((item) =>
                  item.value ? (
                    <a
                      key={item.key}
                      href={toSocialHref(item.value, item.key as 'instagram' | 'tiktok' | 'website' | 'youtube' | 'phone' | 'email')}
                      target={item.key === 'phone' || item.key === 'email' ? undefined : '_blank'}
                      rel={item.key === 'phone' || item.key === 'email' ? undefined : 'noreferrer'}
                      aria-label={item.key}
                      className="transition-opacity hover:opacity-80"
                    >
                      <SocialIcon label={item.short} />
                    </a>
                  ) : null,
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

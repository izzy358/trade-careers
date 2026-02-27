import type { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

const BASE_URL = 'https://frolicking-pastelito-510617.netlify.app';

type JobRow = {
  slug: string;
  created_at: string | null;
  updated_at?: string | null;
};

type InstallerRow = {
  id: string;
  created_at: string | null;
  updated_at?: string | null;
};

const STATIC_PAGES = ['/', '/jobs', '/installers', '/about', '/post-job', '/privacy', '/terms'];

function buildUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

function resolveLastModified(createdAt: string | null, updatedAt?: string | null): Date | undefined {
  const value = updatedAt || createdAt;
  return value ? new Date(value) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: buildUrl(path),
  }));

  const [jobsResult, installersResult] = await Promise.all([
    supabase.from('jobs').select('slug, created_at, updated_at').eq('status', 'active'),
    supabase.from('installers').select('id, created_at, updated_at'),
  ]);

  const jobs: JobRow[] = jobsResult.error
    ? ((
        await supabase
          .from('jobs')
          .select('slug, created_at')
          .eq('status', 'active')
      ).data as JobRow[] | null) || []
    : (jobsResult.data as JobRow[] | null) || [];

  const installers: InstallerRow[] = installersResult.error
    ? ((await supabase.from('installers').select('id, created_at')).data as InstallerRow[] | null) || []
    : (installersResult.data as InstallerRow[] | null) || [];

  const jobEntries: MetadataRoute.Sitemap = jobs
    .filter((job) => Boolean(job.slug))
    .map((job) => ({
      url: buildUrl(`/jobs/${encodeURIComponent(job.slug)}`),
      lastModified: resolveLastModified(job.created_at, job.updated_at),
    }));

  const installerEntries: MetadataRoute.Sitemap = installers
    .filter((installer) => Boolean(installer.id))
    .map((installer) => ({
      url: buildUrl(`/installers/${encodeURIComponent(installer.id)}`),
      lastModified: resolveLastModified(installer.created_at, installer.updated_at),
    }));

  return [...staticEntries, ...jobEntries, ...installerEntries];
}

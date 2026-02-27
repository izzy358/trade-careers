import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { tradeColors, tradeLabel } from '@/utils/constants';
import { JobApplicationSection } from '@/components/JobApplicationSection';
import { buildMetadata } from '@/utils/seo';
import { formatPay } from '@/utils/format';

interface JobDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: job } = await supabase
    .from('jobs')
    .select('title, company_name, location_city, location_state, description, trades')
    .eq('slug', slug)
    .single();

  if (!job) {
    return buildMetadata({
      title: 'Job Not Found | Trade Careers',
      description: 'The requested job listing could not be found.',
      path: `/jobs/${encodeURIComponent(slug)}`,
    });
  }

  const title = `${job.title} at ${job.company_name} | ${job.location_city}, ${job.location_state} | Trade Careers`;
  const description = `${job.description.substring(0, 150)}${job.description.length > 150 ? '...' : ''}`;

  return buildMetadata({
    title,
    description,
    path: `/jobs/${encodeURIComponent(slug)}`,
    type: 'article',
  });
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !job) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-error bg-surface p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Job Not Found</h2>
          <p className="mb-4 text-text-secondary">We could not find the job you are looking for.</p>
          <Link href="/jobs" className="text-primary hover:underline">Browse all jobs</Link>
        </div>
      </div>
    );
  }

  const hasComp = typeof job.pay_min === 'number' && typeof job.pay_max === 'number';

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <nav className="mb-5 text-sm text-text-secondary">
        <Link href="/jobs" className="hover:underline">Jobs</Link> &gt;{' '}
        {job.trades?.[0] ? (
          <Link href={`/jobs?trade=${job.trades[0]}`} className="hover:underline">{tradeLabel(job.trades[0])}</Link>
        ) : (
          <span>Trade</span>
        )}{' '}
        &gt; <span className="text-primary">{job.location_city}, {job.location_state}</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-2/3">
          <div className="mb-4 flex flex-wrap gap-2">
            {(job.trades || []).map((trade: string) => (
              <span key={trade} className={`rounded-full px-3 py-1 text-sm font-medium ${tradeColors[trade] || 'bg-surface-hover text-text-secondary'}`}>
                {tradeLabel(trade)}
              </span>
            ))}
            {job.is_featured ? <span className="text-sm font-semibold text-primary">Featured</span> : null}
          </div>

          <h1 className="mb-2 text-3xl font-bold md:text-4xl">{job.title}</h1>
          <p className="mb-6 text-sm text-text-secondary md:text-base">
            {job.company_name} · {job.location_city}, {job.location_state} · Posted {new Date(job.created_at).toLocaleDateString()}
          </p>

          <div className="mb-8 grid grid-cols-1 gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2">
            <div>
              <p className="text-text-secondary">Pay Range</p>
              <p className="text-lg font-semibold">
                {hasComp ? formatPay(job.pay_min, job.pay_max, job.pay_type) : 'Compensation not listed'}
              </p>
            </div>
            <div>
              <p className="text-text-secondary">Job Type</p>
              <p className="text-lg font-semibold">{job.job_type ? tradeLabel(job.job_type) : 'Not specified'}</p>
            </div>
            <div>
              <p className="text-text-secondary">Location</p>
              <p className="text-lg font-semibold">{job.location_city}, {job.location_state}</p>
            </div>
            <div>
              <p className="text-text-secondary">Trades</p>
              <p className="text-lg font-semibold">{(job.trades || []).map((trade: string) => tradeLabel(trade)).join(', ') || 'Not specified'}</p>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="mb-3 text-2xl font-bold">Job Description</h2>
            <p className="whitespace-pre-line text-text-primary">{job.description}</p>
          </section>

          {job.requirements ? (
            <section className="mb-8">
              <h2 className="mb-3 text-2xl font-bold">Requirements</h2>
              <p className="whitespace-pre-line text-text-primary">{job.requirements}</p>
            </section>
          ) : null}

          <JobApplicationSection jobSlug={job.slug} />
        </div>

        <aside className="w-full space-y-6 lg:w-1/3">
          <div className="rounded-xl border border-border bg-surface p-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-hover text-3xl font-bold uppercase">
              {job.company_name ? job.company_name[0] : ''}
            </div>
            <h3 className="mb-2 text-xl font-bold">{job.company_name}</h3>
            <p className="mb-4 text-text-secondary">{job.location_city}, {job.location_state}</p>
            <a href="#apply" className="block w-full rounded-lg bg-primary px-4 py-2 font-bold text-white transition-colors hover:bg-orange-700">
              Go To Application
            </a>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="mb-4 text-xl font-bold">Share This Job</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <button className="rounded-lg bg-border px-3 py-2 text-text-primary hover:bg-primary/20">Copy Link</button>
              <button className="rounded-lg bg-border px-3 py-2 text-text-primary hover:bg-primary/20">X</button>
              <button className="rounded-lg bg-border px-3 py-2 text-text-primary hover:bg-primary/20">Facebook</button>
              <button className="rounded-lg bg-border px-3 py-2 text-text-primary hover:bg-primary/20">LinkedIn</button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

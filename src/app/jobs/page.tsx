import Link from 'next/link';
import { getJobs } from '@/utils/data';
import { JobCard, type JobCardData } from '@/components/JobCard';
import { JOB_TYPES, TRADES } from '@/utils/constants';
import { buildMetadata } from '@/utils/seo';

interface JobListingsPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    radius?: string;
    trade?: string;
    type?: string;
    payMin?: string;
    payMax?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }>;
}

export const metadata = buildMetadata({
  title: 'Automotive Restyling Jobs | Vinyl Wrap, Tint, PPF Careers | Trade Careers',
  description:
    'Browse automotive restyling jobs by location, pay, and trade specialty including vinyl wrap, window tint, PPF, and detailing.',
  path: '/jobs',
});

export default async function JobListingsPage({ searchParams }: JobListingsPageProps) {
  const resolvedParams = await searchParams;

  const { jobs, error } = await getJobs({
    q: resolvedParams.q,
    location: resolvedParams.location,
    radius: resolvedParams.radius,
    trade: resolvedParams.trade,
    jobType: resolvedParams.type,
    payMin: resolvedParams.payMin,
    payMax: resolvedParams.payMax,
    sort: resolvedParams.sort,
    page: resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1,
    limit: resolvedParams.limit ? parseInt(resolvedParams.limit, 10) : 20,
  });

  return (
    <>
      <div className="z-10 mb-6 border-b border-border bg-background py-4 md:sticky md:top-[72px]">
        <form action="/jobs" method="GET" className="bg-surface p-4 rounded-lg shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              name="q"
              placeholder="Keyword"
              defaultValue={resolvedParams.q || ''}
              className="flex-grow p-3 rounded-lg bg-border border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              defaultValue={resolvedParams.location || ''}
              className="flex-grow p-3 rounded-lg bg-border border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <select name="trade" defaultValue={resolvedParams.trade || ''} className="w-full flex-grow p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Trade</option>
              {TRADES.map((trade) => (
                <option key={trade.value} value={trade.value}>{trade.label}</option>
              ))}
            </select>
            <select name="type" defaultValue={resolvedParams.type || ''} className="w-full flex-grow p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Job Type</option>
              {JOB_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select name="sort" defaultValue={resolvedParams.sort || 'newest'} className="w-full flex-grow p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="newest">Sort: Newest</option>
              <option value="highest-pay">Sort: Highest Pay</option>
            </select>
            <select disabled className="w-full flex-grow p-3 rounded-lg bg-border border border-border text-text-secondary focus:outline-none">
              <option value="">Pay Range</option>
            </select>
            <select
              name="radius"
              defaultValue={resolvedParams.radius || ''}
              className="w-full flex-grow p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Radius</option>
              <option value="25">25mi</option>
              <option value="50">50mi</option>
              <option value="100">100mi</option>
              <option value="200">200mi</option>
            </select>
            <button type="submit" className="w-full md:w-auto px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">
              Apply Filters
            </button>
            <Link href="/jobs" className="w-full md:w-auto px-6 py-3 border border-border rounded-lg text-center hover:border-primary transition-colors">
              Clear All
            </Link>
          </div>
        </form>
      </div>

      <h2 className="text-xl font-bold mb-6">{jobs?.length || 0} jobs found</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {error ? (
          <div className="md:col-span-3 text-center text-error p-8 rounded-xl bg-surface border border-error">
            <p>We could not load jobs right now. Please refresh and try again.</p>
          </div>
        ) : jobs && jobs.length > 0 ? (
          jobs.map((job: JobCardData) => <JobCard key={job.id} job={job} />)
        ) : (
          <div className="md:col-span-3 text-center text-text-secondary p-8 rounded-xl bg-surface border border-border">
            <p className="mb-2 text-4xl" aria-hidden="true">🔎</p>
            <h3 className="text-2xl font-semibold mb-2">No jobs found matching your criteria.</h3>
            <p className="mb-2">Try adjusting your filters.</p>
            <Link href="/jobs" className="text-primary hover:underline">Browse all jobs</Link>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center" />
    </>
  );
}

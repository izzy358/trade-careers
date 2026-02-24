
import Link from 'next/link';
import { getJobs } from '@/utils/data';
import { JobCard } from '@/components/JobCard';
import { JOB_TYPES, TRADES } from '@/utils/constants';

interface JobListingsPageProps {
  searchParams: {
    q?: string;
    location?: string;
    trade?: string;
    type?: string;
    payMin?: string;
    payMax?: string;
    sort?: string;
    page?: string;
    limit?: string;
  };
}

export default async function JobListingsPage({ searchParams }: JobListingsPageProps) {
  const { jobs, error } = await getJobs({
    q: searchParams.q,
    location: searchParams.location,
    trade: searchParams.trade,
    jobType: searchParams.type,
    payMin: searchParams.payMin,
    payMax: searchParams.payMax,
    sort: searchParams.sort,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: searchParams.limit ? parseInt(searchParams.limit) : 20,
  });

  // TODO: Fetch total count for pagination

  return (
    <>
      {/* Search Bar (sticky on scroll) */}
      <div className="sticky top-[64px] bg-background z-10 py-4 border-b border-border mb-6">
        <div className="bg-surface p-4 rounded-lg shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="🔍 Keyword"
              defaultValue={searchParams.q || ''}
              className="flex-grow p-3 rounded-lg bg-border border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="📍 Location"
              defaultValue={searchParams.location || ''}
              className="flex-grow p-3 rounded-lg bg-border border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <select className="flex-grow p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Trade</option>
              {TRADES.map((trade) => (
                <option key={trade.value} value={trade.value}>{trade.label}</option>
              ))}
            </select>
            <select className="flex-grow p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Job Type</option>
              {JOB_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select className="flex-grow p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Pay Range</option>
              {/* TODO: Pay range slider/inputs */}
            </select>
            <select className="flex-grow p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Radius</option>
              <option value="25">25mi</option>
              <option value="50">50mi</option>
              <option value="100">100mi</option>
              <option value="any">Anywhere</option>
            </select>
            <select className="flex-grow p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Sort: Newest</option>
              <option value="closest">Closest</option>
              <option value="highest-pay">Highest Pay</option>
            </select>
            <button className="w-full md:w-auto px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">
              Clear All
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">{jobs?.length || 0} jobs found</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {error ? (
          <div className="md:col-span-3 text-center text-error p-8 rounded-xl bg-surface border border-error">
            <p>Error loading jobs: {error}</p>
          </div>
        ) : jobs && jobs.length > 0 ? (
          jobs.map((job: any) => <JobCard key={job.id} job={job} />)
        ) : (
          <div className="md:col-span-3 text-center text-text-secondary p-8 rounded-xl bg-surface border border-border">
            <h3 className="text-2xl font-semibold mb-2">No jobs found matching your search.</h3>
            <p className="mb-2">Try expanding your radius, removing some filters, or browsing all jobs.</p>
            <Link href="/jobs" className="text-primary hover:underline">Browse all jobs</Link>
          </div>
        )}
      </div>

      {/* Pagination (TODO) */}
      <div className="mt-8 flex justify-center">
        {/* <Pagination /> */}
      </div>
    </>
  );
}


import Link from 'next/link';
import type { Metadata } from 'next';
import { getJobs } from '@/utils/data';
import { JobCard, type JobCardData } from '@/components/JobCard';
import { JOB_TYPES, TRADES } from '@/utils/constants';

export const metadata: Metadata = {
  title: 'Automotive Trades Jobs',
  description: 'Find jobs and installers across vinyl wrap, tint, PPF, ceramic coating, and detailing trades.',
};

export default async function Home() {
  const { jobs: featuredJobs } = await getJobs({ limit: 3, sort: 'newest', is_featured: true });
  const { jobs: recentJobs } = await getJobs({ limit: 5, sort: 'newest' });

  const RecentJobItem = ({ job }: { job: JobCardData }) => (
    <Link href={`/jobs/${job.slug}`} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary sm:flex-row sm:items-center sm:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-xl font-bold uppercase">
        {job.company_name ? job.company_name[0] : ''}
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold transition-colors hover:text-primary md:text-xl">{job.title}</h3>
        <p className="text-text-secondary">{job.company_name} · {job.location_city}, {job.location_state}</p>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-lg font-semibold">${job.pay_min}-{job.pay_max}/{job.pay_type === 'hourly' ? 'hr' : 'yr'}</p>
        <p className="text-text-muted text-sm">{new Date(job.created_at).toLocaleDateString()}</p>
      </div>
    </Link>
  );

  return (
    <>
      {/* Hero Section */}
      <section className="relative my-8 rounded-xl bg-gradient-to-r from-gray-900 to-surface p-6 text-center md:p-16">
        <h1 className="mb-4 text-3xl font-bold md:text-5xl">Find Your Next Install Job</h1>
        <p className="text-lg md:text-xl text-text-secondary mb-8">
          The job board for wrap, tint, PPF & coating professionals
        </p>
        <div className="bg-background p-4 rounded-lg shadow-xl max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="🔍 Job title or keyword"
              className="flex-grow p-3 rounded-lg bg-border border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="📍 City or ZIP"
              className="flex-grow p-3 rounded-lg bg-border border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
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
            <button className="w-full md:w-auto px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">
              Search Jobs
            </button>
          </div>
        </div>
        <p className="text-text-secondary mt-6">
          Popular: <span className="text-primary">Vinyl Wrap</span> · Window Tint · PPF · Ceramic Coating
        </p>
      </section>

      {/* Featured Jobs */}
      <section className="my-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Featured Opportunities</h2>
          <Link href="/jobs" className="text-primary hover:underline">View All &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredJobs && featuredJobs.length > 0 ? (
            featuredJobs.map((job: JobCardData) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="md:col-span-3 text-center text-text-secondary">No featured jobs available at the moment.</div>
          )}
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="my-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Latest Jobs</h2>
          <Link href="/jobs" className="text-primary hover:underline">View All &rarr;</Link>
        </div>
        <div className="space-y-4">
          {recentJobs && recentJobs.length > 0 ? (
            recentJobs.map((job: JobCardData) => <RecentJobItem key={job.id} job={job} />)
          ) : (
            <div className="text-center text-text-secondary">No recent jobs available.</div>
          )}
        </div>
      </section>

      {/* For Employers CTA */}
      <section className="my-12 text-center bg-surface p-12 rounded-xl border border-border">
        <h2 className="text-3xl font-bold mb-4">Hire Skilled Installers</h2>
        <p className="text-lg text-text-secondary mb-8">
          Post your first job free. Reach thousands of verified pros.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link href="/post-job" className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">
            Post a Job — Free
          </Link>
          <Link href="/installers" className="px-8 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary/10 transition-colors">
            Browse Installers
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="my-12 bg-surface p-8 rounded-xl border border-border flex flex-wrap justify-around items-center text-center">
        <div className="w-1/2 md:w-1/4 p-4">
          <p className="text-4xl font-bold text-primary">150+</p>
          <p className="text-text-secondary">Jobs</p>
        </div>
        <div className="w-1/2 md:w-1/4 p-4">
          <p className="text-4xl font-bold text-primary">500+</p>
          <p className="text-text-secondary">Installers</p>
        </div>
        <div className="w-1/2 md:w-1/4 p-4">
          <p className="text-4xl font-bold text-primary">6</p>
          <p className="text-text-secondary">Trades</p>
        </div>
        <div className="w-1/2 md:w-1/4 p-4">
          <p className="text-4xl font-bold text-primary">50</p>
          <p className="text-text-secondary">States</p>
        </div>
      </section>
    </>
  );
}

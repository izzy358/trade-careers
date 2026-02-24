
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { tradeColors } from '@/utils/constants';
import { ApplyForm } from '@/components/ApplyForm';

interface JobDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: job, error } = await supabase
    .from('jobs')
    .select('title, company_name, location_city, location_state, description, trades')
    .eq('slug', slug)
    .single();

  if (!job) {
    return {
      title: 'Job Not Found | WrapCareers',
    };
  }

  const title = `${job.title} at ${job.company_name} — ${job.location_city}, ${job.location_state} | WrapCareers`;
  const description = job.description.substring(0, 160) + '...';
  // TODO: Open Graph image: Auto-generated card with job title + company + trade badges

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      // images: [{ url: '...' }],
    },
    // TODO: JSON-LD: JobPosting schema markup
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    // Handle job not found or other errors
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center">
        <div className="text-center p-8 rounded-xl bg-surface border border-error">
          <h2 className="text-2xl font-bold mb-4">Job Not Found or Error</h2>
          <p className="text-text-secondary mb-4">We could not find the job you are looking for, or an error occurred.</p>
          <Link href="/jobs" className="text-primary hover:underline">Browse all jobs</Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center">
        <div className="text-center p-8 rounded-xl bg-surface border border-border">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <p className="text-text-secondary mb-4">The job you are looking for does not exist.</p>
          <Link href="/jobs" className="text-primary hover:underline">Browse all jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/jobs" className="hover:underline">Jobs</Link> &gt; 
          <Link href={`/jobs?trade=${job.trades[0]}`} className="hover:underline">{job.trades[0].replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</Link> &gt; 
          <span className="text-primary">{job.location_city}, {job.location_state}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content (2/3 width) */}
          <div className="md:w-2/3">
            <div className="flex flex-wrap gap-2 mb-4">
              {job.trades.map((trade: string) => (
                <span key={trade} className={`text-sm font-medium px-3 py-1 rounded-full ${tradeColors[trade] || 'bg-gray-700 text-gray-300'}`}>
                  {trade.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
              ))}
            </div>
            {job.is_featured && (
              <span className="text-primary text-sm font-semibold ml-2">⭐ Featured</span>
            )}

            <h1 className="text-4xl font-bold mt-2 mb-2">{job.title}</h1>
            <p className="text-text-secondary mb-4">{job.company_name} · {job.location_city}, {job.location_state} · Posted {new Date(job.created_at).toLocaleDateString()}</p>

            <div className="grid grid-cols-2 gap-4 bg-surface p-6 rounded-lg border border-border mb-8">
              <div>
                <p className="text-text-secondary">💰 Pay Range</p>
                <p className="text-lg font-semibold">${job.pay_min}-{job.pay_max}/{job.pay_type === 'hourly' ? 'hr' : 'yr'}</p>
              </div>
              <div>
                <p className="text-text-secondary">📋 Job Type</p>
                <p className="text-lg font-semibold">{job.job_type.replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
              </div>
              <div>
                <p className="text-text-secondary">📍 Location</p>
                <p className="text-lg font-semibold">{job.location_city}, {job.location_state}</p>
              </div>
              <div>
                <p className="text-text-secondary">🏷️ Trades</p>
                <p className="text-lg font-semibold">{job.trades.map((trade: string) => trade.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())).join(', ')}</p>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Job Description</h2>
              <div className="prose prose-invert text-text-primary" dangerouslySetInnerHTML={{ __html: job.description }} />
            </section>

            {job.requirements && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                <div className="prose prose-invert text-text-primary" dangerouslySetInnerHTML={{ __html: job.requirements }} />
              </section>
            )}

            <section id="apply" className="bg-surface p-8 rounded-xl border border-border">
              <ApplyForm jobSlug={job.slug} />
            </section>
          </div>

          {/* Sidebar (1/3 width) */}
          <aside className="md:w-1/3 space-y-8">
            {/* Company Card */}
            <div className="bg-surface p-6 rounded-xl border border-border text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold uppercase">{job.company_name ? job.company_name[0] : ''}</div>
              <h3 className="text-xl font-bold mb-2">{job.company_name}</h3>
              <p className="text-text-secondary mb-4">{job.location_city}, {job.location_state}</p>
              {/* <p className="text-text-muted text-sm mb-4">"Premier wrap shop since..."</p> */}
              <Link href="#" className="block w-full px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">Visit Website (TODO)</Link>
            </div>

            {/* Apply Now Button (sticky on mobile) */}
            <div className="bg-surface p-4 rounded-xl border border-border text-center sticky bottom-0 md:static">
              <Link href="#apply" className="block w-full px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">
                Apply Now ▼
              </Link>
            </div>

            {/* Share (Placeholder) */}
            <div className="bg-surface p-6 rounded-xl border border-border">
              <h3 className="text-xl font-bold mb-4">Share This Job</h3>
              <div className="flex justify-center gap-4">
                <button className="p-3 bg-border rounded-lg hover:bg-primary/20 text-text-primary">Copy Link</button>
                <button className="p-3 bg-border rounded-lg hover:bg-primary/20 text-text-primary">X</button>
                <button className="p-3 bg-border rounded-lg hover:bg-primary/20 text-text-primary">Facebook</button>
                <button className="p-3 bg-border rounded-lg hover:bg-primary/20 text-text-primary">LinkedIn</button>
              </div>
            </div>

            {/* Similar Jobs (Placeholder) */}
            <div className="bg-surface p-6 rounded-xl border border-border">
              <h3 className="text-xl font-bold mb-4">Similar Jobs</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-background rounded-lg border border-border">
                    <h4 className="font-semibold">PPF Installer</h4>
                    <p className="text-text-secondary text-sm">Company Name · City, State</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
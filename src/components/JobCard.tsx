import Link from 'next/link';
import { tradeColors } from '@/utils/constants';

export type JobCardData = {
  id: string;
  slug: string;
  title: string;
  company_name: string;
  location_city: string;
  location_state: string;
  trades: string[];
  pay_min: number;
  pay_max: number;
  pay_type: string;
  job_type: string;
  created_at: string;
};

interface JobCardProps {
  job: JobCardData;
}

export function JobCard({ job }: JobCardProps) {
  const payUnit = job.pay_type === 'hourly' ? 'hr' : job.pay_type === 'salary' ? 'yr' : 'job';

  return (
    <Link href={`/jobs/${job.slug}`} className="block bg-surface p-6 rounded-xl border border-border hover:border-primary transition-colors cursor-pointer">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-surface-hover rounded-full mr-4 flex items-center justify-center text-xl font-bold uppercase">
          {job.company_name ? job.company_name[0] : ''}
        </div>
        <div>
          <span className="text-xl font-semibold hover:text-primary transition-colors">
            {job.title}
          </span>
          <p className="text-text-secondary">{job.company_name}</p>
        </div>
      </div>
      <p className="text-text-secondary mb-2">{job.location_city}, {job.location_state}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {job.trades.map((trade: string) => (
          <span key={trade} className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${tradeColors[trade] || 'bg-surface-hover text-text-secondary'}`}>
            {trade.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span>
        ))}
      </div>
      <p className="text-lg font-semibold mb-1">${job.pay_min}-{job.pay_max}/{payUnit}</p>
      <p className="text-text-muted text-sm">{job.job_type.replace(/\b\w/g, (l: string) => l.toUpperCase())} · {new Date(job.created_at).toLocaleDateString()}</p>
    </Link>
  );
}

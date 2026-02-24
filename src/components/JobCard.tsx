
import Link from 'next/link';
import { tradeColors } from '@/utils/constants';

interface JobCardProps {
  job: {
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
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-surface p-6 rounded-xl border border-border hover:border-primary transition-colors">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full mr-4 flex items-center justify-center text-xl font-bold uppercase">
          {job.company_name ? job.company_name[0] : ''}
        </div>
        <div>
          <Link href={`/jobs/${job.slug}`} className="text-xl font-semibold hover:text-primary transition-colors">
            {job.title}
          </Link>
          <p className="text-text-secondary">{job.company_name}</p>
        </div>
      </div>
      <p className="text-text-secondary mb-2">{job.location_city}, {job.location_state}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {job.trades.map((trade: string) => (
          <span key={trade} className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${tradeColors[trade] || 'bg-gray-700 text-gray-300'}`}>
            {trade.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span>
        ))}
      </div>
      <p className="text-lg font-semibold mb-1">${job.pay_min}-{job.pay_max}/{job.pay_type === 'hourly' ? 'hr' : 'yr'}</p>
      <p className="text-text-muted text-sm">{job.job_type.replace(/\b\w/g, (l: string) => l.toUpperCase())} · {new Date(job.created_at).toLocaleDateString()}</p>
    </div>
  );
}

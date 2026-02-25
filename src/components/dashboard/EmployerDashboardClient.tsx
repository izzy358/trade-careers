'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { JOB_TYPES, TRADES } from '@/utils/constants';

type Employer = {
  id: string;
  company_name: string;
  company_email: string | null;
  location: string | null;
  website: string | null;
  logo_url: string | null;
};

type Job = {
  id: string;
  title: string;
  slug: string;
  status: string;
  location_city: string;
  location_state: string;
  created_at: string;
};

type Application = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  jobs: {
    id: string;
    title: string;
    slug: string;
  } | null;
};

type Props = {
  userEmail: string | null;
  initialEmployer: Employer | null;
  initialJobs: Job[];
  applications: Application[];
};

type CompanyForm = {
  company_name: string;
  company_email: string;
  location: string;
  website: string;
  logo_url: string;
};

type JobForm = {
  title: string;
  company_name: string;
  company_email: string;
  company_logo_url: string;
  location_city: string;
  location_state: string;
  trades: string[];
  job_type: string;
  pay_min: string;
  pay_max: string;
  pay_type: 'hourly' | 'salary';
  description: string;
  requirements: string;
  how_to_apply: string;
};

const emptyJob: JobForm = {
  title: '',
  company_name: '',
  company_email: '',
  company_logo_url: '',
  location_city: '',
  location_state: '',
  trades: [],
  job_type: 'full-time',
  pay_min: '',
  pay_max: '',
  pay_type: 'hourly',
  description: '',
  requirements: '',
  how_to_apply: '',
};

export function EmployerDashboardClient({ userEmail, initialEmployer, initialJobs, applications }: Props) {
  const [employer, setEmployer] = useState<Employer | null>(initialEmployer);
  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    company_name: initialEmployer?.company_name ?? '',
    company_email: initialEmployer?.company_email ?? userEmail ?? '',
    location: initialEmployer?.location ?? '',
    website: initialEmployer?.website ?? '',
    logo_url: initialEmployer?.logo_url ?? '',
  });
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [jobForm, setJobForm] = useState<JobForm>({
    ...emptyJob,
    company_name: initialEmployer?.company_name ?? '',
    company_email: initialEmployer?.company_email ?? userEmail ?? '',
  });

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isPostingJob, setIsPostingJob] = useState(false);

  const toggleTrade = (value: string) => {
    setJobForm((prev) => ({
      ...prev,
      trades: prev.trades.includes(value) ? prev.trades.filter((trade) => trade !== value) : [...prev.trades, value],
    }));
  };

  const saveCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSavingCompany(true);

    try {
      const response = await fetch('/api/dashboard/employer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to save company profile.');
      }

      const nextEmployer = payload.employer as Employer;
      setEmployer(nextEmployer);
      setCompanyForm({
        company_name: nextEmployer.company_name,
        company_email: nextEmployer.company_email ?? '',
        location: nextEmployer.location ?? '',
        website: nextEmployer.website ?? '',
        logo_url: nextEmployer.logo_url ?? '',
      });
      setJobForm((prev) => ({
        ...prev,
        company_name: nextEmployer.company_name,
        company_email: nextEmployer.company_email ?? prev.company_email,
      }));
      setNotice('Company profile saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected company profile error.');
    } finally {
      setIsSavingCompany(false);
    }
  };

  const postJob = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!jobForm.title.trim() || !jobForm.location_city.trim() || !jobForm.location_state.trim() || jobForm.trades.length === 0 || !jobForm.description.trim()) {
      setError('Title, location, specialties, and description are required.');
      return;
    }

    setIsPostingJob(true);

    try {
      const response = await fetch('/api/dashboard/employer/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobForm,
          pay_min: jobForm.pay_min ? Number(jobForm.pay_min) : null,
          pay_max: jobForm.pay_max ? Number(jobForm.pay_max) : null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to post job.');
      }

      const created = payload.job as Job;
      setJobs((prev) => [created, ...prev]);
      setJobForm({
        ...emptyJob,
        company_name: companyForm.company_name,
        company_email: companyForm.company_email,
      });
      setNotice('Job posted successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected post job error.');
    } finally {
      setIsPostingJob(false);
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    setError('');
    setNotice('');

    const nextStatus = currentStatus === 'active' ? 'closed' : 'active';

    try {
      const response = await fetch(`/api/dashboard/employer/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to update job status.');
      }

      setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: nextStatus } : job)));
      setNotice(`Job marked as ${nextStatus}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected status update error.');
    }
  };

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>
        <p className="mt-2 text-text-secondary">Manage your company, post jobs, and review applications.</p>
      </header>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-2xl font-semibold">Company Profile</h2>
        <form onSubmit={saveCompany} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input value={companyForm.company_name} onChange={(e) => setCompanyForm((prev) => ({ ...prev, company_name: e.target.value }))} placeholder="Company name" className="rounded-lg border border-border bg-background p-3" required />
          <input value={companyForm.company_email} onChange={(e) => setCompanyForm((prev) => ({ ...prev, company_email: e.target.value }))} placeholder="Company email" className="rounded-lg border border-border bg-background p-3" />
          <input value={companyForm.location} onChange={(e) => setCompanyForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Location" className="rounded-lg border border-border bg-background p-3" />
          <input value={companyForm.website} onChange={(e) => setCompanyForm((prev) => ({ ...prev, website: e.target.value }))} placeholder="Website" className="rounded-lg border border-border bg-background p-3" />
          <input value={companyForm.logo_url} onChange={(e) => setCompanyForm((prev) => ({ ...prev, logo_url: e.target.value }))} placeholder="Logo URL" className="rounded-lg border border-border bg-background p-3 md:col-span-2" />
          <button type="submit" disabled={isSavingCompany} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60 md:col-span-2">
            {isSavingCompany ? 'Saving...' : employer ? 'Update Company' : 'Create Company Profile'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-2xl font-semibold">Post a New Job</h2>
        <form onSubmit={postJob} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input value={jobForm.title} onChange={(e) => setJobForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Job title" className="rounded-lg border border-border bg-background p-3" required />
            <select value={jobForm.job_type} onChange={(e) => setJobForm((prev) => ({ ...prev, job_type: e.target.value }))} className="rounded-lg border border-border bg-background p-3">
              {JOB_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            <input value={jobForm.location_city} onChange={(e) => setJobForm((prev) => ({ ...prev, location_city: e.target.value }))} placeholder="City" className="rounded-lg border border-border bg-background p-3" required />
            <input value={jobForm.location_state} onChange={(e) => setJobForm((prev) => ({ ...prev, location_state: e.target.value.toUpperCase() }))} maxLength={2} placeholder="State" className="rounded-lg border border-border bg-background p-3" required />
          </div>

          <div>
            <p className="mb-2 block text-sm text-text-secondary">Trades *</p>
            <div className="flex flex-wrap gap-2">
              {TRADES.map((trade) => (
                <button key={trade.value} type="button" onClick={() => toggleTrade(trade.value)} className={`rounded-lg border px-3 py-2 text-sm ${jobForm.trades.includes(trade.value) ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-secondary hover:border-primary'}`}>
                  {trade.label}
                </button>
              ))}
            </div>
          </div>

          <textarea value={jobForm.description} onChange={(e) => setJobForm((prev) => ({ ...prev, description: e.target.value }))} rows={5} placeholder="Job description" className="w-full rounded-lg border border-border bg-background p-3" required />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input value={jobForm.pay_min} onChange={(e) => setJobForm((prev) => ({ ...prev, pay_min: e.target.value }))} type="number" placeholder="Min pay" className="rounded-lg border border-border bg-background p-3" />
            <input value={jobForm.pay_max} onChange={(e) => setJobForm((prev) => ({ ...prev, pay_max: e.target.value }))} type="number" placeholder="Max pay" className="rounded-lg border border-border bg-background p-3" />
            <select value={jobForm.pay_type} onChange={(e) => setJobForm((prev) => ({ ...prev, pay_type: e.target.value as 'hourly' | 'salary' }))} className="rounded-lg border border-border bg-background p-3">
              <option value="hourly">Hourly</option>
              <option value="salary">Salary</option>
            </select>
          </div>

          <textarea value={jobForm.requirements} onChange={(e) => setJobForm((prev) => ({ ...prev, requirements: e.target.value }))} rows={3} placeholder="Requirements (optional)" className="w-full rounded-lg border border-border bg-background p-3" />
          <textarea value={jobForm.how_to_apply} onChange={(e) => setJobForm((prev) => ({ ...prev, how_to_apply: e.target.value }))} rows={3} placeholder="How to apply (optional)" className="w-full rounded-lg border border-border bg-background p-3" />

          <button type="submit" disabled={isPostingJob} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
            {isPostingJob ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </section>

      {error ? <div className="rounded-lg border border-error bg-error/10 p-3 text-sm text-error">{error}</div> : null}
      {notice ? <div className="rounded-lg border border-success bg-success/10 p-3 text-sm text-success">{notice}</div> : null}

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-2xl font-semibold">Your Job Postings</h2>
        {jobs.length === 0 ? (
          <p className="text-text-secondary">No job postings yet.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <article key={job.id} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{job.title}</p>
                    <p className="text-sm text-text-secondary">{job.location_city}, {job.location_state} · {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs ${job.status === 'active' ? 'bg-success/20 text-success' : 'bg-border text-text-secondary'}`}>{job.status}</span>
                    <button type="button" onClick={() => toggleJobStatus(job.id, job.status)} className="rounded-lg border border-border px-3 py-1 text-sm hover:border-primary">
                      {job.status === 'active' ? 'Close' : 'Reopen'}
                    </button>
                    <Link href={`/jobs/${job.slug}`} className="rounded-lg border border-border px-3 py-1 text-sm hover:border-primary">View</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-2xl font-semibold">Applications Received</h2>
        {applications.length === 0 ? (
          <p className="text-text-secondary">No applications received yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((application) => (
              <article key={application.id} className="rounded-lg border border-border bg-background p-4">
                <p className="font-semibold text-white">{application.name} applied to {application.jobs?.title || 'a job'}</p>
                <p className="text-sm text-text-secondary">{application.email}{application.phone ? ` · ${application.phone}` : ''}</p>
                {application.message ? <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{application.message}</p> : null}
                <p className="mt-2 text-xs text-text-secondary">{new Date(application.created_at).toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

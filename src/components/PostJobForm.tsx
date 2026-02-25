'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { JOB_TYPES, TRADES } from '@/utils/constants';

type FormData = {
  title: string;
  description: string;
  company_name: string;
  company_email: string;
  location_city: string;
  location_state: string;
  job_type: string;
  trades: string[];
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialData: FormData = {
  title: '',
  description: '',
  company_name: '',
  company_email: '',
  location_city: '',
  location_state: '',
  job_type: '',
  trades: [],
};

export function PostJobForm() {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postedJob, setPostedJob] = useState<{ slug: string; title: string } | null>(null);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleTrade = (value: string) => {
    const nextTrades = formData.trades.includes(value)
      ? formData.trades.filter((item) => item !== value)
      : [...formData.trades, value];

    updateField('trades', nextTrades);
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.title.trim()) nextErrors.title = 'Job title is required.';
    if (!formData.description.trim()) nextErrors.description = 'Description is required.';
    if (!formData.company_name.trim()) nextErrors.company_name = 'Company name is required.';

    if (!formData.company_email.trim()) {
      nextErrors.company_email = 'Company email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)) {
      nextErrors.company_email = 'Enter a valid email address.';
    }

    if (!formData.location_city.trim()) nextErrors.location_city = 'City is required.';
    if (!formData.location_state.trim()) nextErrors.location_state = 'State is required.';
    if (!formData.job_type) nextErrors.job_type = 'Job type is required.';
    if (formData.trades.length === 0) nextErrors.trades = 'Select at least one trade.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to publish your job.');
      }

      setPostedJob({ slug: payload.job.slug, title: payload.job.title });
      setFormData(initialData);
      setErrors({});
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Unexpected error while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (postedJob) {
    return (
      <div className="rounded-2xl border border-green-500/60 bg-[#1a1f2e] p-6 md:p-8">
        <h2 className="mb-2 text-3xl font-bold text-green-400">Job Posted Successfully</h2>
        <p className="mb-6 text-gray-300">
          <span className="font-semibold text-white">{postedJob.title}</span> is now live.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/jobs/${postedJob.slug}`}
            className="rounded-lg bg-primary px-6 py-3 text-center font-bold text-white transition-colors hover:bg-orange-700"
          >
            View Job Posting
          </Link>
          <button
            type="button"
            onClick={() => setPostedJob(null)}
            className="rounded-lg border border-border px-6 py-3 hover:border-primary"
          >
            Post Another Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[#2f3747] bg-[#1a1f2e] p-5 md:p-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-gray-300">Job Title *</label>
          <input
            value={formData.title}
            onChange={(event) => updateField('title', event.target.value)}
            className="w-full rounded-lg border border-[#2f3747] bg-[#0d1117] p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Lead PPF Installer"
          />
          {errors.title ? <p className="mt-1 text-sm text-red-400">{errors.title}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Company Name *</label>
          <input
            value={formData.company_name}
            onChange={(event) => updateField('company_name', event.target.value)}
            className="w-full rounded-lg border border-[#2f3747] bg-[#0d1117] p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.company_name ? <p className="mt-1 text-sm text-red-400">{errors.company_name}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Company Email *</label>
          <input
            type="email"
            value={formData.company_email}
            onChange={(event) => updateField('company_email', event.target.value)}
            className="w-full rounded-lg border border-[#2f3747] bg-[#0d1117] p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.company_email ? <p className="mt-1 text-sm text-red-400">{errors.company_email}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">City *</label>
          <input
            value={formData.location_city}
            onChange={(event) => updateField('location_city', event.target.value)}
            className="w-full rounded-lg border border-[#2f3747] bg-[#0d1117] p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.location_city ? <p className="mt-1 text-sm text-red-400">{errors.location_city}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">State *</label>
          <input
            value={formData.location_state}
            onChange={(event) => updateField('location_state', event.target.value.toUpperCase())}
            maxLength={2}
            className="w-full rounded-lg border border-[#2f3747] bg-[#0d1117] p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="TX"
          />
          {errors.location_state ? <p className="mt-1 text-sm text-red-400">{errors.location_state}</p> : null}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-gray-300">Job Type *</label>
          <select
            value={formData.job_type}
            onChange={(event) => updateField('job_type', event.target.value)}
            className="w-full rounded-lg border border-[#2f3747] bg-[#0d1117] p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select job type</option>
            {JOB_TYPES.filter((type) => ['full-time', 'part-time', 'contract'].includes(type.value)).map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {errors.job_type ? <p className="mt-1 text-sm text-red-400">{errors.job_type}</p> : null}
        </div>

        <div className="md:col-span-2">
          <p className="mb-2 text-sm text-gray-300">Trades * (Select one or more)</p>
          <div className="flex flex-wrap gap-2">
            {TRADES.map((trade) => {
              const selected = formData.trades.includes(trade.value);
              return (
                <button
                  key={trade.value}
                  type="button"
                  onClick={() => toggleTrade(trade.value)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    selected
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-[#2f3747] text-gray-300 hover:border-primary'
                  }`}
                >
                  {trade.label}
                </button>
              );
            })}
          </div>
          {errors.trades ? <p className="mt-1 text-sm text-red-400">{errors.trades}</p> : null}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-gray-300">Description *</label>
          <textarea
            rows={7}
            value={formData.description}
            onChange={(event) => updateField('description', event.target.value)}
            className="w-full rounded-lg border border-[#2f3747] bg-[#0d1117] p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Describe responsibilities, shift expectations, and experience needed."
          />
          {errors.description ? <p className="mt-1 text-sm text-red-400">{errors.description}</p> : null}
        </div>
      </div>

      {submitError ? (
        <div className="mt-4 rounded-lg border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-300">{submitError}</div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Publishing Job...' : 'Publish Job'}
      </button>
    </form>
  );
}

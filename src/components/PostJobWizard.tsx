'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { JOB_TYPES, TRADES } from '@/utils/constants';

type JobFormData = {
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
  pay_type: 'hourly' | 'salary' | 'per-job';
  description: string;
  requirements: string;
  how_to_apply: string;
};

type StepErrors = Partial<Record<keyof JobFormData, string>>;

const stepLabels = ['Job Details', 'Contact Info', 'Review & Submit'];

const initialData: JobFormData = {
  title: '',
  company_name: '',
  company_email: '',
  company_logo_url: '',
  location_city: '',
  location_state: '',
  trades: [],
  job_type: '',
  pay_min: '',
  pay_max: '',
  pay_type: 'hourly',
  description: '',
  requirements: '',
  how_to_apply: '',
};

function toLabel(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function PostJobWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<JobFormData>(initialData);
  const [errors, setErrors] = useState<StepErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postedJob, setPostedJob] = useState<{ slug: string; title: string } | null>(null);
  const descriptionLength = formData.description.length;

  const selectedJobTypeLabel = useMemo(() => {
    return JOB_TYPES.find((type) => type.value === formData.job_type)?.label ?? formData.job_type;
  }, [formData.job_type]);

  const updateField = <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleTrade = (tradeValue: string) => {
    const nextTrades = formData.trades.includes(tradeValue)
      ? formData.trades.filter((trade) => trade !== tradeValue)
      : [...formData.trades, tradeValue];

    updateField('trades', nextTrades);
  };

  const validateStep = (step: number) => {
    const nextErrors: StepErrors = {};

    if (step === 0) {
      if (!formData.title.trim()) nextErrors.title = 'Job title is required.';
      if (!formData.location_city.trim()) nextErrors.location_city = 'City is required.';
      if (!formData.location_state.trim()) nextErrors.location_state = 'State is required.';
      if (!formData.job_type) nextErrors.job_type = 'Job type is required.';
      if (formData.trades.length === 0) nextErrors.trades = 'Select at least one trade.';
      if (!formData.description.trim()) {
        nextErrors.description = 'Description is required.';
      } else if (formData.description.trim().length < 50) {
        nextErrors.description = 'Description must be at least 50 characters.';
      }

      const payMin = Number(formData.pay_min);
      const payMax = Number(formData.pay_max);
      if (!formData.pay_min || Number.isNaN(payMin) || payMin < 0) {
        nextErrors.pay_min = 'Valid minimum pay is required.';
      }
      if (!formData.pay_max || Number.isNaN(payMax) || payMax < 0) {
        nextErrors.pay_max = 'Valid maximum pay is required.';
      }
      if (!nextErrors.pay_min && !nextErrors.pay_max && payMin > payMax) {
        nextErrors.pay_max = 'Maximum pay must be greater than or equal to minimum pay.';
      }
    }

    if (step === 1) {
      if (!formData.company_name.trim()) nextErrors.company_name = 'Company name is required.';
      if (!formData.company_email.trim()) {
        nextErrors.company_email = 'Contact email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)) {
        nextErrors.company_email = 'Enter a valid email address.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((step) => Math.min(step + 1, 2));
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1)) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pay_min: Number(formData.pay_min),
          pay_max: Number(formData.pay_max),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to publish your job right now.');
      }

      setPostedJob({ slug: payload.job.slug, title: payload.job.title });
      setFormData(initialData);
      setErrors({});
      setCurrentStep(0);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Unexpected error while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (postedJob) {
    return (
      <div className="bg-surface border border-success rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-success mb-3">Job Posted</h2>
        <p className="text-text-secondary mb-6">
          <span className="text-text-primary font-semibold">{postedJob.title}</span> is now live.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/jobs/${postedJob.slug}`}
            className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors text-center"
          >
            View Job Posting
          </Link>
          <button
            type="button"
            onClick={() => setPostedJob(null)}
            className="px-6 py-3 border border-border rounded-lg hover:border-primary transition-colors"
          >
            Post Another Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
      <p className="mb-5 text-sm text-text-secondary">Jobs are listed for 30 days.</p>
      <ol className="grid grid-cols-3 gap-3 mb-8">
        {stepLabels.map((label, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <li
              key={label}
              className={`rounded-lg px-3 py-3 text-sm border ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : isCompleted
                    ? 'border-success bg-success/10 text-success'
                    : 'border-border text-text-secondary'
              }`}
            >
              <span className="block text-xs uppercase tracking-wide mb-1">Step {index + 1}</span>
              <span className="font-semibold">{label}</span>
            </li>
          );
        })}
      </ol>

      {currentStep === 0 && (
        <section className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-2">Job title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="e.g. Lead PPF Installer"
              className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {errors.title && <p className="text-error text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <p className="block text-sm font-medium text-text-secondary mb-2">Trades *</p>
            <div className="flex flex-wrap gap-2">
              {TRADES.map((trade) => {
                const selected = formData.trades.includes(trade.value);
                return (
                  <button
                    key={trade.value}
                    type="button"
                    onClick={() => toggleTrade(trade.value)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      selected
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border text-text-secondary hover:border-primary'
                    }`}
                  >
                    {trade.label}
                  </button>
                );
              })}
            </div>
            {errors.trades && <p className="text-error text-sm mt-1">{errors.trades}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="job_type" className="block text-sm font-medium text-text-secondary mb-2">Job type *</label>
              <select
                id="job_type"
                value={formData.job_type}
                onChange={(event) => updateField('job_type', event.target.value)}
                className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select job type</option>
                {JOB_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.job_type && <p className="text-error text-sm mt-1">{errors.job_type}</p>}
            </div>

            <div>
              <label htmlFor="pay_type" className="block text-sm font-medium text-text-secondary mb-2">Pay type</label>
              <select
                id="pay_type"
                value={formData.pay_type}
                onChange={(event) => updateField('pay_type', event.target.value as JobFormData['pay_type'])}
                className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="hourly">Hourly</option>
                <option value="salary">Salary</option>
                <option value="per-job">Per Job</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location_city" className="block text-sm font-medium text-text-secondary mb-2">City *</label>
              <input
                id="location_city"
                type="text"
                value={formData.location_city}
                onChange={(event) => updateField('location_city', event.target.value)}
                className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {errors.location_city && <p className="text-error text-sm mt-1">{errors.location_city}</p>}
            </div>

            <div>
              <label htmlFor="location_state" className="block text-sm font-medium text-text-secondary mb-2">State *</label>
              <input
                id="location_state"
                type="text"
                maxLength={2}
                value={formData.location_state}
                onChange={(event) => updateField('location_state', event.target.value.toUpperCase())}
                placeholder="e.g. TX"
                className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {errors.location_state && <p className="text-error text-sm mt-1">{errors.location_state}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pay_min" className="block text-sm font-medium text-text-secondary mb-2">Minimum pay *</label>
              <input
                id="pay_min"
                type="number"
                min={0}
                value={formData.pay_min}
                onChange={(event) => updateField('pay_min', event.target.value)}
                className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {errors.pay_min && <p className="text-error text-sm mt-1">{errors.pay_min}</p>}
            </div>

            <div>
              <label htmlFor="pay_max" className="block text-sm font-medium text-text-secondary mb-2">Maximum pay *</label>
              <input
                id="pay_max"
                type="number"
                min={0}
                value={formData.pay_max}
                onChange={(event) => updateField('pay_max', event.target.value)}
                className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {errors.pay_max && <p className="text-error text-sm mt-1">{errors.pay_max}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">Job description *</label>
            <textarea
              id="description"
              rows={6}
              value={formData.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Describe responsibilities, schedule, and role expectations."
              className="w-full p-3 rounded-lg bg-border border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              minLength={50}
              required
            />
            <p className={`text-xs mt-1 ${descriptionLength < 50 ? 'text-error' : 'text-text-secondary'}`}>
              {descriptionLength}/50 characters minimum
            </p>
            {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-text-secondary mb-2">Requirements (optional)</label>
            <textarea
              id="requirements"
              rows={4}
              value={formData.requirements}
              onChange={(event) => updateField('requirements', event.target.value)}
              placeholder="List required experience, certifications, or tools."
              className="w-full p-3 rounded-lg bg-border border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </section>
      )}

      {currentStep === 1 && (
        <section className="space-y-5">
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-text-secondary mb-2">Company name *</label>
            <input
              id="company_name"
              type="text"
              value={formData.company_name}
              onChange={(event) => updateField('company_name', event.target.value)}
              className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {errors.company_name && <p className="text-error text-sm mt-1">{errors.company_name}</p>}
          </div>

          <div>
            <label htmlFor="company_email" className="block text-sm font-medium text-text-secondary mb-2">Contact email *</label>
            <input
              id="company_email"
              type="email"
              value={formData.company_email}
              onChange={(event) => updateField('company_email', event.target.value)}
              className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {errors.company_email && <p className="text-error text-sm mt-1">{errors.company_email}</p>}
          </div>

          <div>
            <label htmlFor="company_logo_url" className="block text-sm font-medium text-text-secondary mb-2">Company logo URL (optional)</label>
            <input
              id="company_logo_url"
              type="url"
              value={formData.company_logo_url}
              onChange={(event) => updateField('company_logo_url', event.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full p-3 rounded-lg bg-border border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="how_to_apply" className="block text-sm font-medium text-text-secondary mb-2">How should candidates apply? (optional)</label>
            <textarea
              id="how_to_apply"
              rows={4}
              value={formData.how_to_apply}
              onChange={(event) => updateField('how_to_apply', event.target.value)}
              placeholder="Example: Email your resume and portfolio link with subject 'Lead Installer Application'."
              className="w-full p-3 rounded-lg bg-border border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </section>
      )}

      {currentStep === 2 && (
        <section className="space-y-6">
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-background px-4 py-3 border-b border-border">
              <h3 className="font-semibold">Basic Job Details</h3>
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 text-sm">
              <div>
                <dt className="text-text-secondary mb-1">Title</dt>
                <dd>{formData.title}</dd>
              </div>
              <div>
                <dt className="text-text-secondary mb-1">Company</dt>
                <dd>{formData.company_name}</dd>
              </div>
              <div>
                <dt className="text-text-secondary mb-1">Location</dt>
                <dd>{formData.location_city}, {formData.location_state}</dd>
              </div>
              <div>
                <dt className="text-text-secondary mb-1">Job Type</dt>
                <dd>{selectedJobTypeLabel}</dd>
              </div>
              <div>
                <dt className="text-text-secondary mb-1">Pay</dt>
                <dd>
                  ${formData.pay_min} - ${formData.pay_max}
                  {' / '}
                  {formData.pay_type === 'hourly' ? 'hr' : formData.pay_type === 'salary' ? 'yr' : 'job'}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary mb-1">Trades</dt>
                <dd>{formData.trades.map((trade) => toLabel(trade)).join(', ')}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-text-secondary whitespace-pre-line">{formData.description}</p>
          </div>

          {formData.requirements && (
            <div className="rounded-xl border border-border p-4">
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="text-text-secondary whitespace-pre-line">{formData.requirements}</p>
            </div>
          )}

          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-2">Contact</h3>
            <p className="text-text-secondary">{formData.company_email}</p>
            {formData.how_to_apply && (
              <p className="text-text-secondary whitespace-pre-line mt-2">{formData.how_to_apply}</p>
            )}
          </div>

          {submitError && <p className="text-error text-sm">{submitError}</p>}
        </section>
      )}

      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <button
          type="button"
          disabled={currentStep === 0}
          onClick={handleBack}
          className="px-5 py-2.5 rounded-lg border border-border hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {currentStep < 2 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Job'}
          </button>
        )}
      </div>
    </div>
  );
}

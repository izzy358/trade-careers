'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type ApplyData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

type ApplyErrors = Partial<Record<keyof ApplyData, string>>;

const initialData: ApplyData = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export function ApplyForm({ jobSlug }: { jobSlug: string }) {
  const [formData, setFormData] = useState<ApplyData>(initialData);
  const [errors, setErrors] = useState<ApplyErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const nextErrors: ApplyErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Name is required.';

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (!formData.message.trim()) nextErrors.message = 'Cover letter/message is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = <K extends keyof ApplyData>(field: K, value: ApplyData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/jobs/${jobSlug}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          resume_url: '',
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to submit application.');
      }

      setIsSubmitted(true);
      setFormData(initialData);
      setErrors({});
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Unexpected error while submitting application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-xl border border-green-500/60 bg-green-500/10 p-6 text-center">
        <h3 className="mb-2 text-2xl font-semibold text-green-400">Application Submitted</h3>
        <p className="mb-4 text-text-secondary">
          Thanks for applying. The employer will review your information and contact you directly.
        </p>
        <Link href="/jobs" className="text-primary hover:underline">
          Browse more jobs
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm text-text-secondary">Name *</label>
        <input
          value={formData.name}
          onChange={(event) => updateField('name', event.target.value)}
          className="w-full rounded-lg border border-border bg-background p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.name ? <p className="mt-1 text-sm text-error">{errors.name}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm text-text-secondary">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(event) => updateField('email', event.target.value)}
          className="w-full rounded-lg border border-border bg-background p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.email ? <p className="mt-1 text-sm text-error">{errors.email}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm text-text-secondary">Phone *</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(event) => updateField('phone', event.target.value)}
          className="w-full rounded-lg border border-border bg-background p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.phone ? <p className="mt-1 text-sm text-error">{errors.phone}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm text-text-secondary">Cover Letter / Message *</label>
        <textarea
          rows={6}
          value={formData.message}
          onChange={(event) => updateField('message', event.target.value)}
          className="w-full rounded-lg border border-border bg-background p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Introduce yourself, your trade experience, and availability."
        />
        {errors.message ? <p className="mt-1 text-sm text-error">{errors.message}</p> : null}
      </div>

      {submitError ? (
        <div className="rounded-lg border border-error bg-error/10 p-3 text-sm text-error">{submitError}</div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}

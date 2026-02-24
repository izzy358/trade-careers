'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { TRADES, tradeLabel } from '@/utils/constants';

type CreatedInstaller = {
  name: string;
  slug: string;
};

const initialData = {
  name: '',
  email: '',
  location: '',
  bio: '',
  years_experience: '',
  portfolio: '',
  specialties: [] as string[],
  is_available: true,
};

export default function InstallerRegistrationPage() {
  const [formData, setFormData] = useState(initialData);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedInstaller | null>(null);

  const portfolioUrls = useMemo(
    () => formData.portfolio.split('\n').map((line) => line.trim()).filter(Boolean),
    [formData.portfolio],
  );

  const toggleSpecialty = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(value)
        ? prev.specialties.filter((item) => item !== value)
        : [...prev.specialties, value],
    }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!formData.name || !formData.email || !formData.location || !formData.bio || formData.specialties.length === 0) {
      setSubmitError('Please fill all required fields and select at least one specialty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/installers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          years_experience: formData.years_experience ? Number(formData.years_experience) : null,
          portfolio_urls: portfolioUrls,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to create installer profile.');
      }

      setCreated({ name: payload.installer.name, slug: payload.installer.slug });
      setFormData(initialData);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Unexpected error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="max-w-2xl mx-auto bg-surface border border-success rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-success mb-3">Profile Published</h1>
        <p className="text-text-secondary mb-6">
          {created.name} is now listed in the installer directory.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/installers/${created.slug}`}
            className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors text-center"
          >
            View Profile
          </Link>
          <button
            type="button"
            onClick={() => setCreated(null)}
            className="px-6 py-3 border border-border rounded-lg hover:border-primary"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-3">Create Installer Profile</h1>
      <p className="text-text-secondary mb-8">Add your specialties and portfolio so employers can find you.</p>

      <form onSubmit={onSubmit} className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Full name *</label>
            <input
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full p-3 rounded-lg bg-background border border-border"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full p-3 rounded-lg bg-background border border-border"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Location (City, ST) *</label>
            <input
              value={formData.location}
              onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
              className="w-full p-3 rounded-lg bg-background border border-border"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Years of experience</label>
            <input
              type="number"
              min={0}
              value={formData.years_experience}
              onChange={(event) => setFormData((prev) => ({ ...prev, years_experience: event.target.value }))}
              className="w-full p-3 rounded-lg bg-background border border-border"
            />
          </div>
        </div>

        <div>
          <p className="block text-sm text-text-secondary mb-2">Specialties *</p>
          <div className="flex flex-wrap gap-2">
            {TRADES.map((trade) => {
              const selected = formData.specialties.includes(trade.value);
              return (
                <button
                  key={trade.value}
                  type="button"
                  onClick={() => toggleSpecialty(trade.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
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
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">Bio *</label>
          <textarea
            rows={5}
            value={formData.bio}
            onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))}
            className="w-full p-3 rounded-lg bg-background border border-border"
            placeholder="Share your background, services, and what types of jobs you want."
            required
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">Portfolio links (one URL per line)</label>
          <textarea
            rows={4}
            value={formData.portfolio}
            onChange={(event) => setFormData((prev) => ({ ...prev, portfolio: event.target.value }))}
            className="w-full p-3 rounded-lg bg-background border border-border"
            placeholder="https://instagram.com/your-shop\nhttps://yourportfolio.com"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={formData.is_available}
            onChange={(event) => setFormData((prev) => ({ ...prev, is_available: event.target.checked }))}
          />
          Open to new opportunities
        </label>

        {submitError ? (
          <div className="rounded-lg border border-error bg-error/10 p-3 text-sm text-error">{submitError}</div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-60"
        >
          {isSubmitting ? 'Creating Profile...' : 'Publish Profile'}
        </button>
      </form>

      <div className="mt-6 text-sm text-text-secondary">
        Selected specialties: {formData.specialties.length > 0 ? formData.specialties.map(tradeLabel).join(', ') : 'None'}
      </div>
    </div>
  );
}

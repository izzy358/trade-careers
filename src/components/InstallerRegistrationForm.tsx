'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { TRADES, tradeLabel } from '@/utils/constants';

type CreatedInstaller = {
  id: string;
  name: string;
};

const initialData = {
  name: '',
  location: '',
  bio: '',
  instagram: '',
  tiktok: '',
  website: '',
  youtube: '',
  phone: '',
  email: '',
  specialties: [] as string[],
};

export function InstallerRegistrationForm() {
  const [formData, setFormData] = useState(initialData);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedInstaller | null>(null);

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

    if (!formData.name || !formData.location || !formData.bio || formData.specialties.length === 0) {
      setSubmitError('Please fill all required fields and select at least one specialty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/installers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          bio: formData.bio,
          specialties: formData.specialties,
          instagram: formData.instagram,
          tiktok: formData.tiktok,
          website: formData.website,
          youtube: formData.youtube,
          phone: formData.phone,
          email: formData.email,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to create installer profile.');
      }

      setCreated({ id: payload.installer.id, name: payload.installer.name });
      setFormData(initialData);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Unexpected error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-success bg-surface p-8">
        <h1 className="mb-3 text-3xl font-bold text-success">Profile Published</h1>
        <p className="mb-6 text-text-secondary">
          {created.name} is now listed in the installer directory.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/installers/${created.id}`}
            className="rounded-lg bg-primary px-6 py-3 text-center font-bold text-white transition-colors hover:bg-orange-700"
          >
            View Profile
          </Link>
          <button
            type="button"
            onClick={() => setCreated(null)}
            className="rounded-lg border border-border px-6 py-3 hover:border-primary"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-3 text-4xl font-bold">Create Installer Profile</h1>
      <p className="mb-8 text-text-secondary">Add your specialties and background so employers can find you.</p>

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div>
          <label className="mb-2 block text-sm text-text-secondary">Full name *</label>
          <input
            value={formData.name}
            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background p-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-text-secondary">Location (City, ST) *</label>
          <input
            value={formData.location}
            onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background p-3"
            required
          />
        </div>

        <div>
          <p className="mb-2 block text-sm text-text-secondary">Specialties *</p>
          <div className="flex flex-wrap gap-2">
            {TRADES.map((trade) => {
              const selected = formData.specialties.includes(trade.value);
              return (
                <button
                  key={trade.value}
                  type="button"
                  onClick={() => toggleSpecialty(trade.value)}
                  className={`rounded-lg border px-3 py-2 text-sm ${
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
          <label className="mb-2 block text-sm text-text-secondary">Bio *</label>
          <textarea
            rows={5}
            value={formData.bio}
            onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background p-3"
            placeholder="Share your background, services, and what types of jobs you want."
            required
          />
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-4">
          <h2 className="mb-3 text-lg font-semibold text-text-primary">Socials (Optional)</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-text-secondary">Instagram</label>
              <input
                value={formData.instagram}
                onChange={(event) => setFormData((prev) => ({ ...prev, instagram: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background p-3"
                placeholder="@yourhandle or full URL"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-text-secondary">TikTok</label>
              <input
                value={formData.tiktok}
                onChange={(event) => setFormData((prev) => ({ ...prev, tiktok: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background p-3"
                placeholder="@yourhandle or full URL"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-text-secondary">Website</label>
              <input
                value={formData.website}
                onChange={(event) => setFormData((prev) => ({ ...prev, website: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background p-3"
                placeholder="https://yourshop.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-text-secondary">YouTube</label>
              <input
                value={formData.youtube}
                onChange={(event) => setFormData((prev) => ({ ...prev, youtube: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background p-3"
                placeholder="https://youtube.com/@channel"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-text-secondary">Phone</label>
              <input
                value={formData.phone}
                onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background p-3"
                placeholder="(555) 555-5555"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-text-secondary">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background p-3"
                placeholder="you@example.com"
              />
            </div>
          </div>
        </div>

        {submitError ? (
          <div className="rounded-lg border border-error bg-error/10 p-3 text-sm text-error">{submitError}</div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
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

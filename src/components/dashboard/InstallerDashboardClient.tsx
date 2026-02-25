'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { TRADES, tradeLabel } from '@/utils/constants';
import { createClient } from '@/utils/supabase/client';
import { Avatar } from '@/components/Avatar';

type Installer = {
  id: string;
  name: string;
  location: string;
  specialties: string[];
  bio: string | null;
  years_experience: number | null;
  is_available: boolean | null;
  instagram: string | null;
  tiktok: string | null;
  website: string | null;
  youtube: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  slug: string | null;
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
    company_name: string;
    location_city: string;
    location_state: string;
  } | null;
};

type Props = {
  userId: string;
  userEmail: string | null;
  initialInstaller: Installer | null;
  applications: Application[];
};

type InstallerForm = {
  name: string;
  location: string;
  specialties: string[];
  bio: string;
  years_experience: string;
  is_available: boolean;
  instagram: string;
  tiktok: string;
  website: string;
  youtube: string;
  phone: string;
  email: string;
  avatar_url: string;
};

function formFromInstaller(installer: Installer | null, fallbackEmail: string | null): InstallerForm {
  return {
    name: installer?.name ?? '',
    location: installer?.location ?? '',
    specialties: installer?.specialties ?? [],
    bio: installer?.bio ?? '',
    years_experience: installer?.years_experience ? String(installer.years_experience) : '',
    is_available: installer?.is_available ?? true,
    instagram: installer?.instagram ?? '',
    tiktok: installer?.tiktok ?? '',
    website: installer?.website ?? '',
    youtube: installer?.youtube ?? '',
    phone: installer?.phone ?? '',
    email: installer?.email ?? fallbackEmail ?? '',
    avatar_url: installer?.avatar_url ?? '',
  };
}

async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 400;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to process image.');
  }

  ctx.drawImage(bitmap, 0, 0, width, height);

  let quality = 0.92;
  let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));

  while (blob && blob.size > 500_000 && quality > 0.45) {
    quality -= 0.08;
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  }

  if (!blob) {
    throw new Error('Failed to convert image.');
  }

  if (blob.size > 500_000) {
    throw new Error('Compressed image is still larger than 500KB. Choose a smaller image.');
  }

  return blob;
}

export function InstallerDashboardClient({ userId, userEmail, initialInstaller, applications }: Props) {
  const [installer, setInstaller] = useState<Installer | null>(initialInstaller);
  const [form, setForm] = useState<InstallerForm>(formFromInstaller(initialInstaller, userEmail));
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const profileUrl = useMemo(() => (installer?.id ? `/installers/${installer.id}` : null), [installer?.id]);

  const toggleSpecialty = (value: string) => {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(value)
        ? prev.specialties.filter((item) => item !== value)
        : [...prev.specialties, value],
    }));
  };

  const saveProfile = async (nextForm: InstallerForm = form) => {
    setError('');
    setNotice('');

    if (!nextForm.name.trim() || !nextForm.location.trim() || nextForm.specialties.length === 0) {
      setError('Name, location, and at least one specialty are required.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/dashboard/installer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nextForm,
          years_experience: nextForm.years_experience ? Number(nextForm.years_experience) : null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to save installer profile.');
      }

      setInstaller(payload.installer as Installer);
      setForm(formFromInstaller(payload.installer as Installer, userEmail));
      setNotice('Profile saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected save error.');
    } finally {
      setIsSaving(false);
    }
  };

  const onUploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setNotice('');
    setIsUploading(true);

    try {
      const resized = await resizeImage(file);
      const supabase = createClient();
      const path = `${userId}/avatar-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, resized, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = publicUrlData.publicUrl;

      const nextForm = { ...form, avatar_url: avatarUrl };
      setForm(nextForm);
      await saveProfile(nextForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveProfile();
  };

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-3xl font-bold">Installer Dashboard</h1>
        <p className="mt-2 text-text-secondary">Manage your public profile and track your applications.</p>
      </header>

      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={form.name || 'Installer'} url={form.avatar_url || null} size={72} />
          <div>
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-border px-3 py-2 text-sm hover:border-primary">
              <input type="file" accept="image/*" onChange={onUploadAvatar} className="hidden" />
              {isUploading ? 'Uploading...' : 'Upload Profile Picture'}
            </label>
            <p className="mt-1 text-xs text-text-secondary">Max 500KB, auto-resized to 400x400.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-text-secondary">Name *</label>
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-lg border border-border bg-background p-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-text-secondary">Location *</label>
              <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} className="w-full rounded-lg border border-border bg-background p-3" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-text-secondary">Bio</label>
            <textarea rows={5} value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} className="w-full rounded-lg border border-border bg-background p-3" />
          </div>

          <div>
            <p className="mb-2 block text-sm text-text-secondary">Specialties *</p>
            <div className="flex flex-wrap gap-2">
              {TRADES.map((trade) => (
                <button
                  key={trade.value}
                  type="button"
                  onClick={() => toggleSpecialty(trade.value)}
                  className={`rounded-lg border px-3 py-2 text-sm ${form.specialties.includes(trade.value) ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-secondary hover:border-primary'}`}
                >
                  {trade.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-text-secondary">Selected: {form.specialties.map(tradeLabel).join(', ') || 'None'}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-text-secondary">Years Experience</label>
              <input type="number" min={0} max={60} value={form.years_experience} onChange={(e) => setForm((prev) => ({ ...prev, years_experience: e.target.value }))} className="w-full rounded-lg border border-border bg-background p-3" />
            </div>
            <div className="md:col-span-2 flex items-end">
              <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-3">
                <input type="checkbox" checked={form.is_available} onChange={(e) => setForm((prev) => ({ ...prev, is_available: e.target.checked }))} />
                <span>Open to work</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input value={form.instagram} onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))} placeholder="Instagram" className="rounded-lg border border-border bg-background p-3" />
            <input value={form.tiktok} onChange={(e) => setForm((prev) => ({ ...prev, tiktok: e.target.value }))} placeholder="TikTok" className="rounded-lg border border-border bg-background p-3" />
            <input value={form.website} onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} placeholder="Website" className="rounded-lg border border-border bg-background p-3" />
            <input value={form.youtube} onChange={(e) => setForm((prev) => ({ ...prev, youtube: e.target.value }))} placeholder="YouTube" className="rounded-lg border border-border bg-background p-3" />
            <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="rounded-lg border border-border bg-background p-3" />
            <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="rounded-lg border border-border bg-background p-3" />
          </div>

          {error ? <div className="rounded-lg border border-error bg-error/10 p-3 text-sm text-error">{error}</div> : null}
          {notice ? <div className="rounded-lg border border-success bg-success/10 p-3 text-sm text-success">{notice}</div> : null}

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={isSaving || isUploading} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
            {profileUrl ? (
              <Link href={profileUrl} className="rounded-lg border border-border px-4 py-3 hover:border-primary">
                View Public Profile
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-3 text-2xl font-semibold">Jobs You Applied To</h2>
        {applications.length === 0 ? (
          <p className="text-text-secondary">No tracked applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((application) => (
              <article key={application.id} className="rounded-lg border border-border bg-background p-4">
                <p className="font-semibold text-white">{application.jobs?.title || 'Job listing'}</p>
                <p className="text-sm text-text-secondary">
                  {application.jobs?.company_name || 'Company'}
                  {application.jobs?.location_city ? ` · ${application.jobs.location_city}, ${application.jobs.location_state}` : ''}
                </p>
                <p className="mt-1 text-xs text-text-secondary">Applied {new Date(application.created_at).toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

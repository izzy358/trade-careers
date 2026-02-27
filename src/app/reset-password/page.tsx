'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setNotice('Password updated successfully. You can now log in.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update password right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 md:p-8">
      <h1 className="mb-2 text-3xl font-bold">Reset Password</h1>
      <p className="mb-6 text-text-secondary">Enter and confirm your new password.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-text-secondary">New password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
            className="w-full rounded-lg border border-border bg-background p-3"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-text-secondary">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
            className="w-full rounded-lg border border-border bg-background p-3"
          />
        </div>

        {error ? <div className="rounded-lg border border-error bg-error/10 p-3 text-sm text-error">{error}</div> : null}
        {notice ? (
          <div className="rounded-lg border border-success bg-success/10 p-3 text-sm text-success">
            {notice}{' '}
            <Link href="/login" className="underline">
              Go to login
            </Link>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Updating password...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const RESET_REDIRECT_URL = 'https://frolicking-pastelito-510617.netlify.app/reset-password';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: RESET_REDIRECT_URL,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setNotice('Check your email for a password reset link');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset email right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 md:p-8">
      <h1 className="mb-2 text-3xl font-bold">Forgot Password</h1>
      <p className="mb-6 text-text-secondary">Enter your email and we&apos;ll send a reset link.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-text-secondary">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background p-3"
          />
        </div>

        {error ? <div className="rounded-lg border border-error bg-error/10 p-3 text-sm text-error">{error}</div> : null}
        {notice ? <div className="rounded-lg border border-success bg-success/10 p-3 text-sm text-success">{notice}</div> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-4 text-sm text-text-secondary">
        Remembered your password?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

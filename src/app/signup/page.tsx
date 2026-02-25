'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { AccountType } from '@/utils/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('installer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { account_type: accountType },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) {
        throw new Error(signupError.message);
      }

      if (!data.user) {
        throw new Error('Signup did not return a user account.');
      }

      // Try to create profile now (works if email confirmation is disabled)
      // If it fails due to RLS (user not confirmed yet), that's OK —
      // the auth callback or login page will create it from user metadata
      if (data.session) {
        await supabase
          .from('profiles')
          .upsert({ id: data.user.id, account_type: accountType }, { onConflict: 'id' });
      }

      if (!data.session) {
        setNotice('Check your email to confirm your account, then log in.');
        return;
      }

      router.push(accountType === 'installer' ? '/dashboard/installer' : '/dashboard/employer');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected signup error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 md:p-8">
      <h1 className="mb-2 text-3xl font-bold">Sign Up</h1>
      <p className="mb-6 text-text-secondary">Create an installer or employer account.</p>

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

        <div>
          <label className="mb-2 block text-sm text-text-secondary">Password</label>
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
          <p className="mb-2 block text-sm text-text-secondary">Account type</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAccountType('installer')}
              className={`rounded-lg border px-3 py-2 text-sm ${accountType === 'installer' ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-secondary hover:border-primary'}`}
            >
              Installer
            </button>
            <button
              type="button"
              onClick={() => setAccountType('employer')}
              className={`rounded-lg border px-3 py-2 text-sm ${accountType === 'employer' ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-secondary hover:border-primary'}`}
            >
              Employer / Shop
            </button>
          </div>
        </div>

        {error ? <div className="rounded-lg border border-error bg-error/10 p-3 text-sm text-error">{error}</div> : null}
        {notice ? <div className="rounded-lg border border-success bg-success/10 p-3 text-sm text-success">{notice}</div> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

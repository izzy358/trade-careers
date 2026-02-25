'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { AccountType } from '@/utils/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (!data.user) {
        throw new Error('Unable to sign in right now.');
      }

      let { data: profile } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', data.user.id)
        .maybeSingle();

      // If profile doesn't exist yet (email confirmation flow), create it from user metadata
      if (!profile) {
        const metaType = data.user.user_metadata?.account_type || 'installer';
        await supabase
          .from('profiles')
          .upsert({ id: data.user.id, account_type: metaType }, { onConflict: 'id' });
        profile = { account_type: metaType };
      }

      const accountType = (profile?.account_type as AccountType | undefined) ?? null;
      if (redirectTo !== '/dashboard') {
        router.push(redirectTo);
      } else if (accountType === 'installer') {
        router.push('/dashboard/installer');
      } else if (accountType === 'employer') {
        router.push('/dashboard/employer');
      } else {
        router.push('/dashboard');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected login error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 md:p-8">
      <h1 className="mb-2 text-3xl font-bold">Login</h1>
      <p className="mb-6 text-text-secondary">Access your installer or employer dashboard.</p>

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
            required
            className="w-full rounded-lg border border-border bg-background p-3"
          />
        </div>

        {error ? <div className="rounded-lg border border-error bg-error/10 p-3 text-sm text-error">{error}</div> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-sm text-text-secondary">
        No account yet?{' '}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

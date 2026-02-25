'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { AccountType } from '@/utils/auth';

type AuthState = {
  loading: boolean;
  userId: string | null;
  accountType: AccountType | null;
};

export function AuthNav({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [state, setState] = useState<AuthState>({ loading: true, userId: null, accountType: null });
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        setState({ loading: false, userId: null, accountType: null });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', authData.user.id)
        .maybeSingle();

      setState({
        loading: false,
        userId: authData.user.id,
        accountType: (profile?.account_type as AccountType | undefined) ?? null,
      });
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      load();
      router.refresh();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const dashboardHref = useMemo(() => {
    if (state.accountType === 'installer') return '/dashboard/installer';
    if (state.accountType === 'employer') return '/dashboard/employer';
    return '/dashboard';
  }, [state.accountType]);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    if (onNavigate) onNavigate();
    router.push('/');
    router.refresh();
  };

  const linkClass = mobile
    ? 'rounded-lg border border-border px-3 py-2 hover:border-primary'
    : 'hover:text-primary';

  if (state.loading) {
    return <span className={mobile ? 'rounded-lg border border-border px-3 py-2 text-text-secondary' : 'text-text-secondary'}>...</span>;
  }

  if (!state.userId) {
    return (
      <>
        <Link href="/login" className={linkClass} onClick={onNavigate}>Login</Link>
        <Link href="/signup" className={mobile ? 'rounded-lg bg-primary px-3 py-2 text-center text-white' : 'rounded-lg bg-primary px-3 py-2 text-white hover:bg-orange-700'} onClick={onNavigate}>Sign Up</Link>
      </>
    );
  }

  return (
    <>
      <Link href={dashboardHref} className={linkClass} onClick={onNavigate}>Dashboard</Link>
      <button type="button" onClick={logout} className={mobile ? 'rounded-lg border border-border px-3 py-2 text-left hover:border-primary' : 'hover:text-primary'}>
        Log Out
      </button>
    </>
  );
}

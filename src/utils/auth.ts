import { createClient } from '@/utils/supabase/server';

export type AccountType = 'installer' | 'employer';

export type SessionContext = {
  user: {
    id: string;
    email: string | null;
  };
  accountType: AccountType | null;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', authData.user.id)
    .maybeSingle();

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email ?? null,
    },
    accountType: (profile?.account_type as AccountType | undefined) ?? null,
  };
}

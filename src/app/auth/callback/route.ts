import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextPath = searchParams.get('next');

  const safeNextPath = nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')
    ? nextPath
    : null;

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // Create profile from user metadata if it doesn't exist yet
      const accountType = session.user.user_metadata?.account_type || 'installer';
      await supabase
        .from('profiles')
        .upsert({ id: session.user.id, account_type: accountType }, { onConflict: 'id' });

      // Redirect to appropriate dashboard
      const dashboardPath = accountType === 'employer' ? '/dashboard/employer' : '/dashboard/installer';
      return NextResponse.redirect(`${origin}${safeNextPath ?? dashboardPath}`);
    }
  }

  // If something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth`);
}

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sanitizePlainText } from '@/utils/api';

const employerSchema = z.object({
  company_name: z.string().trim().min(2).max(120),
  company_email: z.string().trim().email().max(254).optional().or(z.literal('')),
  location: z.string().trim().max(120).optional().or(z.literal('')),
  website: z.string().trim().max(500).optional().or(z.literal('')),
  logo_url: z.string().trim().max(500).optional().or(z.literal('')),
});

async function assertEmployerAccount() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { supabase, user: null as null, error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profile?.account_type !== 'employer') {
    return { supabase, user: null as null, error: NextResponse.json({ error: 'Employer account required.' }, { status: 403 }) };
  }

  return { supabase, user: authData.user, error: null as NextResponse<unknown> | null };
}

export async function GET() {
  const auth = await assertEmployerAccount();
  if (auth.error) return auth.error;
  if (!auth.user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { data, error } = await auth.supabase
    .from('employers')
    .select('id, company_name, company_email, location, website, logo_url, created_at')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to load employer profile.' }, { status: 500 });
  }

  return NextResponse.json({ employer: data ?? null });
}

export async function PUT(request: NextRequest) {
  const auth = await assertEmployerAccount();
  if (auth.error) return auth.error;
  if (!auth.user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = employerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid employer profile fields.' }, { status: 400 });
  }

  const employer = parsed.data;

  const upsertPayload = {
    user_id: auth.user.id,
    company_name: sanitizePlainText(employer.company_name, 120),
    company_email: employer.company_email ? sanitizePlainText(employer.company_email.toLowerCase(), 254) : null,
    location: employer.location ? sanitizePlainText(employer.location, 120) : null,
    website: employer.website ? sanitizePlainText(employer.website, 500) : null,
    logo_url: employer.logo_url ? sanitizePlainText(employer.logo_url, 500) : null,
  };

  const { data, error } = await auth.supabase
    .from('employers')
    .upsert(upsertPayload, { onConflict: 'user_id' })
    .select('id, company_name, company_email, location, website, logo_url')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to save employer profile.' }, { status: 500 });
  }

  return NextResponse.json({ employer: data });
}

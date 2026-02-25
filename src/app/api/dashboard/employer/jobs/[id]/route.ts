import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const statusSchema = z.object({
  status: z.enum(['active', 'closed']),
});

async function assertEmployerAccount() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { supabase, employerId: null as null, error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profile?.account_type !== 'employer') {
    return { supabase, employerId: null as null, error: NextResponse.json({ error: 'Employer account required.' }, { status: 403 }) };
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('id')
    .eq('user_id', authData.user.id)
    .maybeSingle();

  if (!employer?.id) {
    return { supabase, employerId: null as null, error: NextResponse.json({ error: 'Employer profile not found.' }, { status: 404 }) };
  }

  return { supabase, employerId: employer.id, error: null as NextResponse<unknown> | null };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await assertEmployerAccount();
  if (auth.error) return auth.error;
  if (!auth.employerId) return NextResponse.json({ error: 'Employer profile required.' }, { status: 400 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid job status.' }, { status: 400 });
  }

  const { id } = await params;

  const { data, error } = await auth.supabase
    .from('jobs')
    .update({ status: parsed.data.status })
    .eq('id', id)
    .eq('employer_id', auth.employerId)
    .select('id, status')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update job status.' }, { status: 500 });
  }

  return NextResponse.json({ job: data });
}

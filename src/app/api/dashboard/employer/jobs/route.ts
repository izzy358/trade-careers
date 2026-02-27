import { randomBytes } from 'crypto';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sanitizePlainText, sanitizeSearchTerm } from '@/utils/api';

const jobTypeSchema = z.enum(['full-time', 'part-time', 'contract', 'gig']);

const postJobSchema = z.object({
  title: z.string().trim().min(3).max(120),
  company_name: z.string().trim().min(2).max(120),
  company_email: z.string().trim().email().max(254),
  company_logo_url: z.string().trim().max(500).optional().or(z.literal('')),
  location_city: z.string().trim().min(2).max(80),
  location_state: z.string().trim().length(2),
  trades: z.array(z.string().trim().min(1).max(40)).min(1).max(6),
  job_type: jobTypeSchema,
  pay_min: z.number().int().min(0).max(1000000).nullable().optional(),
  pay_max: z.number().int().min(0).max(1000000).nullable().optional(),
  pay_type: z.enum(['hourly', 'salary', 'per-job']).optional(),
  description: z.string().trim().min(10).max(8000),
  requirements: z.string().trim().max(4000).optional().or(z.literal('')),
  how_to_apply: z.string().trim().max(2000).optional().or(z.literal('')),
});

function createSlug(title: string, city: string, state: string) {
  const normalizedTitle = sanitizeSearchTerm(title.toLowerCase(), 80).replace(/\s+/g, '-').replace(/-+/g, '-');
  const normalizedCity = sanitizeSearchTerm(city.toLowerCase(), 40).replace(/\s+/g, '-').replace(/-+/g, '-');
  const normalizedState = sanitizeSearchTerm(state.toLowerCase(), 2);
  const suffix = randomBytes(3).toString('hex');

  return `${normalizedTitle}-${normalizedCity}-${normalizedState}-${suffix}`
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

async function assertEmployerAccount() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { supabase, user: null as null, employerId: null as null, error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profile?.account_type !== 'employer') {
    return { supabase, user: null as null, employerId: null as null, error: NextResponse.json({ error: 'Employer account required.' }, { status: 403 }) };
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('id')
    .eq('user_id', authData.user.id)
    .maybeSingle();

  if (!employer?.id) {
    return { supabase, user: null as null, employerId: null as null, error: NextResponse.json({ error: 'Please save your company profile before posting jobs.' }, { status: 400 }) };
  }

  return { supabase, user: authData.user, employerId: employer.id, error: null as NextResponse<unknown> | null };
}

export async function GET() {
  const auth = await assertEmployerAccount();
  if (auth.error) return auth.error;
  if (!auth.employerId) return NextResponse.json({ error: 'Employer profile required.' }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('jobs')
    .select('id, title, slug, status, location_city, location_state, created_at, expires_at')
    .eq('employer_id', auth.employerId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to load jobs.' }, { status: 500 });
  }

  return NextResponse.json({ jobs: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await assertEmployerAccount();
  if (auth.error) return auth.error;
  if (!auth.employerId) return NextResponse.json({ error: 'Employer profile required.' }, { status: 400 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = postJobSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid job posting fields.' }, { status: 400 });
  }

  const job = parsed.data;
  if (typeof job.pay_min === 'number' && typeof job.pay_max === 'number' && job.pay_max < job.pay_min) {
    return NextResponse.json({ error: 'Pay range is invalid.' }, { status: 400 });
  }

  const slug = createSlug(job.title, job.location_city, job.location_state);
  const manageToken = randomBytes(24).toString('hex');

  const { data, error } = await auth.supabase
    .from('jobs')
    .insert({
      title: sanitizePlainText(job.title, 120),
      company_name: sanitizePlainText(job.company_name, 120),
      company_email: sanitizePlainText(job.company_email.toLowerCase(), 254),
      company_logo_url: job.company_logo_url ? sanitizePlainText(job.company_logo_url, 500) : null,
      location_city: sanitizePlainText(job.location_city, 80),
      location_state: sanitizePlainText(job.location_state.toUpperCase(), 2),
      trades: job.trades.map((value) => sanitizePlainText(value.toLowerCase(), 40)),
      job_type: job.job_type,
      pay_min: job.pay_min ?? null,
      pay_max: job.pay_max ?? null,
      pay_type: job.pay_type ?? null,
      description: sanitizePlainText(job.description, 8000),
      requirements: job.requirements ? sanitizePlainText(job.requirements, 4000) : null,
      how_to_apply: job.how_to_apply ? sanitizePlainText(job.how_to_apply, 2000) : null,
      slug,
      manage_token: manageToken,
      employer_id: auth.employerId,
    })
    .select('id, title, slug, status, location_city, location_state, created_at, expires_at')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Unable to publish job right now. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ job: data }, { status: 201 });
}

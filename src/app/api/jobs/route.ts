import { randomBytes } from 'crypto';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit, parseNumberInRange, sanitizePlainText, sanitizeSearchTerm } from '@/utils/api';

const PUBLIC_JOB_COLUMNS = 'id, slug, created_at, title, company_name, company_logo_url, location_city, location_state, trades, job_type, pay_min, pay_max, pay_type, description, requirements, how_to_apply, is_featured, status';

const jobTypeSchema = z.enum(['full-time', 'part-time', 'contract', 'gig']);

const postJobSchema = z.object({
  title: z.string().trim().min(3).max(120),
  company_name: z.string().trim().min(2).max(120),
  company_email: z.email().max(254),
  company_logo_url: z.string().trim().url().max(500).optional().or(z.literal('')),
  location_city: z.string().trim().min(2).max(80),
  location_state: z.string().trim().length(2),
  trades: z.array(z.string().trim().min(1).max(40)).min(1).max(6),
  job_type: jobTypeSchema,
  pay_min: z.number().int().min(0).max(1000000).optional(),
  pay_max: z.number().int().min(0).max(1000000).optional(),
  pay_type: z.enum(['hourly', 'salary']).optional(),
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

export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request, { key: 'jobs:get', maxRequests: 120, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;

  const q = sanitizeSearchTerm(searchParams.get('q') || '');
  const location = sanitizeSearchTerm(searchParams.get('location') || '');
  const trade = sanitizeSearchTerm(searchParams.get('trade') || '', 40);
  const jobType = searchParams.get('type') || '';
  const payMin = searchParams.get('payMin');
  const payMax = searchParams.get('payMax');
  const sort = searchParams.get('sort') || 'newest';
  const page = parseNumberInRange(searchParams.get('page'), 1, 10_000, 1);
  const limit = parseNumberInRange(searchParams.get('limit'), 1, 50, 20);
  const offset = (page - 1) * limit;

  let query = supabase
    .from('jobs')
    .select(PUBLIC_JOB_COLUMNS)
    .eq('status', 'active');

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,company_name.ilike.%${q}%`);
  }
  if (location) {
    query = query.or(`location_city.ilike.%${location}%,location_state.ilike.%${location}%`);
  }
  if (trade) {
    query = query.contains('trades', [trade]);
  }
  if (jobType && jobTypeSchema.safeParse(jobType).success) {
    query = query.eq('job_type', jobType);
  }
  if (payMin) {
    const safePayMin = parseNumberInRange(payMin, 0, 1_000_000, 0);
    query = query.gte('pay_min', safePayMin);
  }
  if (payMax) {
    const safePayMax = parseNumberInRange(payMax, 0, 1_000_000, 1_000_000);
    query = query.lte('pay_max', safePayMax);
  }

  if (sort === 'highest-pay') {
    query = query.order('pay_max', { ascending: false }).order('pay_min', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Unable to load jobs at this time.' },
      { status: 500, headers: rateLimit.headers },
    );
  }

  return NextResponse.json({ jobs: data || [] }, { headers: rateLimit.headers });
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, { key: 'jobs:post', maxRequests: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return NextResponse.json(
      { error: 'You must be logged in as an employer to post a job.' },
      { status: 401, headers: rateLimit.headers },
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profile?.account_type !== 'employer') {
    return NextResponse.json(
      { error: 'Employer account required to post jobs.' },
      { status: 403, headers: rateLimit.headers },
    );
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('id')
    .eq('user_id', authData.user.id)
    .maybeSingle();

  if (!employer?.id) {
    return NextResponse.json(
      { error: 'Please complete your employer profile in the dashboard before posting jobs.' },
      { status: 400, headers: rateLimit.headers },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const parsed = postJobSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid job posting fields. Please review and try again.' },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const job = parsed.data;
  if (typeof job.pay_min === 'number' && typeof job.pay_max === 'number' && job.pay_max < job.pay_min) {
    return NextResponse.json(
      { error: 'Pay range is invalid.' },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const slug = createSlug(job.title, job.location_city, job.location_state);
  const manageToken = randomBytes(24).toString('hex');

  const { data, error } = await supabase
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
      employer_id: employer.id,
    })
    .select('id, slug, title, created_at')
    .single();

  if (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Unable to publish job right now. Please try again.' },
      { status: 500, headers: rateLimit.headers },
    );
  }

  return NextResponse.json({ job: data }, { status: 201, headers: rateLimit.headers });
}

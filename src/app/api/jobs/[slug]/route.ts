import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit, sanitizePlainText, sanitizeSearchTerm } from '@/utils/api';

const PUBLIC_JOB_COLUMNS = 'id, slug, created_at, title, company_name, company_logo_url, location_city, location_state, trades, job_type, pay_min, pay_max, pay_type, description, requirements, how_to_apply, is_featured, status';

const updateJobSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    company_name: z.string().trim().min(2).max(120).optional(),
    company_logo_url: z.string().trim().url().max(500).optional().or(z.literal('')),
    location_city: z.string().trim().min(2).max(80).optional(),
    location_state: z.string().trim().length(2).optional(),
    trades: z.array(z.string().trim().min(1).max(40)).min(1).max(6).optional(),
    job_type: z.enum(['full-time', 'part-time', 'contract', 'gig']).optional(),
    pay_min: z.number().int().min(0).max(1000000).optional(),
    pay_max: z.number().int().min(0).max(1000000).optional(),
    pay_type: z.enum(['hourly', 'salary']).optional(),
    description: z.string().trim().min(10).max(8000).optional(),
    requirements: z.string().trim().max(4000).optional().or(z.literal('')),
    how_to_apply: z.string().trim().max(2000).optional().or(z.literal('')),
    status: z.enum(['active', 'inactive', 'closed']).optional(),
  })
  .strict();

function sanitizeSlug(rawSlug: string) {
  return sanitizeSearchTerm(rawSlug.toLowerCase(), 160).replace(/\s+/g, '-').replace(/-+/g, '-');
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const rateLimit = checkRateLimit(request, { key: 'jobs:detail:get', maxRequests: 180, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const supabase = await createClient();
  const { slug } = await params;
  const safeSlug = sanitizeSlug(slug);

  const { data, error } = await supabase
    .from('jobs')
    .select(PUBLIC_JOB_COLUMNS)
    .eq('slug', safeSlug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: rateLimit.headers });
    }

    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Unable to fetch this job right now.' },
      { status: 500, headers: rateLimit.headers },
    );
  }

  return NextResponse.json({ job: data }, { headers: rateLimit.headers });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const rateLimit = checkRateLimit(request, { key: 'jobs:detail:put', maxRequests: 30, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const supabase = await createClient();
  const { slug } = await params;
  const safeSlug = sanitizeSlug(slug);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const manageToken = typeof (body as { manage_token?: unknown })?.manage_token === 'string'
    ? (body as { manage_token: string }).manage_token.trim()
    : '';

  if (!manageToken) {
    return NextResponse.json(
      { error: 'Authorization token is required.' },
      { status: 401, headers: rateLimit.headers },
    );
  }

  const updatesPayload = { ...(body as Record<string, unknown>) };
  delete updatesPayload.manage_token;
  const parsedUpdates = updateJobSchema.safeParse(updatesPayload);

  if (!parsedUpdates.success) {
    return NextResponse.json(
      { error: 'Invalid update payload.' },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const updates = parsedUpdates.data;
  if (updates.pay_min !== undefined && updates.pay_max !== undefined && updates.pay_max < updates.pay_min) {
    return NextResponse.json(
      { error: 'Pay range is invalid.' },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const sanitizedUpdates: Record<string, unknown> = {
    ...updates,
    ...(updates.title ? { title: sanitizePlainText(updates.title, 120) } : {}),
    ...(updates.company_name ? { company_name: sanitizePlainText(updates.company_name, 120) } : {}),
    ...(updates.company_logo_url !== undefined
      ? { company_logo_url: updates.company_logo_url ? sanitizePlainText(updates.company_logo_url, 500) : null }
      : {}),
    ...(updates.location_city ? { location_city: sanitizePlainText(updates.location_city, 80) } : {}),
    ...(updates.location_state ? { location_state: sanitizePlainText(updates.location_state.toUpperCase(), 2) } : {}),
    ...(updates.trades ? { trades: updates.trades.map((value) => sanitizePlainText(value.toLowerCase(), 40)) } : {}),
    ...(updates.description ? { description: sanitizePlainText(updates.description, 8000) } : {}),
    ...(updates.requirements !== undefined
      ? { requirements: updates.requirements ? sanitizePlainText(updates.requirements, 4000) : null }
      : {}),
    ...(updates.how_to_apply !== undefined
      ? { how_to_apply: updates.how_to_apply ? sanitizePlainText(updates.how_to_apply, 2000) : null }
      : {}),
  };

  const { data, error } = await supabase
    .from('jobs')
    .update(sanitizedUpdates)
    .eq('slug', safeSlug)
    .eq('manage_token', manageToken)
    .select('id, slug, title, status, created_at')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Job not found or unauthorized.' },
        { status: 404, headers: rateLimit.headers },
      );
    }

    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Unable to update job right now.' },
      { status: 500, headers: rateLimit.headers },
    );
  }

  return NextResponse.json({ job: data }, { headers: rateLimit.headers });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const rateLimit = checkRateLimit(request, { key: 'jobs:detail:delete', maxRequests: 15, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const supabase = await createClient();
  const { slug } = await params;
  const safeSlug = sanitizeSlug(slug);
  const manageToken = sanitizePlainText(request.nextUrl.searchParams.get('token') || '', 256);

  if (!manageToken) {
    return NextResponse.json(
      { error: 'Authorization token is required.' },
      { status: 401, headers: rateLimit.headers },
    );
  }

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('slug', safeSlug)
    .eq('manage_token', manageToken);

  if (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Unable to delete job right now.' },
      { status: 500, headers: rateLimit.headers },
    );
  }

  return NextResponse.json({ message: 'Job deleted successfully' }, { headers: rateLimit.headers });
}

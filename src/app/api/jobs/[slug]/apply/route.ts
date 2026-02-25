import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit, sanitizePlainText, sanitizeSearchTerm } from '@/utils/api';

const applySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().min(7).max(30).optional().or(z.literal('')),
  message: z.string().trim().min(10).max(4000),
  resume_url: z.string().trim().url().max(500).optional().or(z.literal('')),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const rateLimit = checkRateLimit(request, { key: 'jobs:apply:post', maxRequests: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const { slug } = await params;
  const safeSlug = sanitizeSearchTerm(slug.toLowerCase(), 160).replace(/\s+/g, '-');

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const parsed = applySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please complete all required fields with valid details.' },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const { data: jobData, error: jobError } = await supabase
    .from('jobs')
    .select('id')
    .eq('slug', safeSlug)
    .single();

  if (jobError || !jobData) {
    return NextResponse.json(
      { error: 'Job not found.' },
      { status: 404, headers: rateLimit.headers },
    );
  }

  const { data: applicationData, error: applicationError } = await supabase
    .from('applications')
    .insert({
      job_id: jobData.id,
      user_id: authData.user?.id ?? null,
      name: sanitizePlainText(parsed.data.name, 120),
      email: sanitizePlainText(parsed.data.email.toLowerCase(), 254),
      phone: parsed.data.phone ? sanitizePlainText(parsed.data.phone, 30) : null,
      message: sanitizePlainText(parsed.data.message, 4000),
      resume_url: parsed.data.resume_url ? sanitizePlainText(parsed.data.resume_url, 500) : '',
    })
    .select('id, created_at, job_id, name, email')
    .single();

  if (applicationError) {
    console.error('Error saving application:', applicationError);

    if (applicationError.code === '42501') {
      return NextResponse.json(
        { error: 'Applications are currently unavailable. Please try again later.' },
        { status: 403, headers: rateLimit.headers },
      );
    }

    return NextResponse.json(
      { error: 'Unable to submit application right now.' },
      { status: 500, headers: rateLimit.headers },
    );
  }

  return NextResponse.json(
    { application: applicationData, message: 'Application submitted successfully' },
    { status: 201, headers: rateLimit.headers },
  );
}

import { randomBytes } from 'crypto';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit, parseNumberInRange, sanitizePlainText, sanitizeSearchTerm } from '@/utils/api';

const PUBLIC_INSTALLER_COLUMNS = 'id, slug, created_at, name, location, specialties, bio, years_experience, is_available, instagram, tiktok, website, youtube, phone, email, avatar_url';

const postInstallerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  bio: z.string().trim().min(10).max(4000),
  specialties: z.array(z.string().trim().min(1).max(40)).min(1).max(8),
  instagram: z.string().trim().max(120).optional().or(z.literal('')),
  tiktok: z.string().trim().max(120).optional().or(z.literal('')),
  website: z.string().trim().url().max(500).optional().or(z.literal('')),
  youtube: z.string().trim().max(200).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.email().max(254).optional().or(z.literal('')),
});

function makeInstallerSlug(name: string) {
  const base = sanitizeSearchTerm(name.toLowerCase(), 80)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${randomBytes(3).toString('hex')}`;
}

export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request, { key: 'installers:get', maxRequests: 120, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
    );
  }

  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const q = sanitizeSearchTerm(searchParams.get('q') || '');
    const location = sanitizeSearchTerm(searchParams.get('location') || '');
    const specialty = sanitizeSearchTerm(searchParams.get('specialty') || '', 40);
    const availability = searchParams.get('availability');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseNumberInRange(searchParams.get('page'), 1, 10_000, 1);
    const limit = parseNumberInRange(searchParams.get('limit'), 1, 50, 12);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('installers')
      .select(PUBLIC_INSTALLER_COLUMNS);

    if (q) {
      query = query.or(`name.ilike.%${q}%,bio.ilike.%${q}%`);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    if (specialty) {
      query = query.contains('specialties', [specialty]);
    }
    if (availability === 'true') {
      query = query.eq('is_available', true);
    }

    if (sort === 'name-asc') {
      query = query.order('name', { ascending: true });
    } else if (sort === 'experience-desc') {
      query = query.order('years_experience', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching installers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch installers.' },
        { status: 500, headers: rateLimit.headers },
      );
    }

    return NextResponse.json({ installers: data || [] }, { headers: rateLimit.headers });
  } catch (error) {
    console.error('Unhandled installers GET error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, { key: 'installers:post', maxRequests: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
    );
  }

  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create an installer profile.' },
        { status: 401, headers: rateLimit.headers },
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profile?.account_type !== 'installer') {
      return NextResponse.json(
        { error: 'Installer account required to create installer profile.' },
        { status: 403, headers: rateLimit.headers },
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

    const parsed = postInstallerSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid installer profile fields.' },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const installer = parsed.data;
    const slug = makeInstallerSlug(installer.name);
    const manageToken = randomBytes(24).toString('hex');

    const { data, error } = await supabase
      .from('installers')
      .insert({
        user_id: authData.user.id,
        name: sanitizePlainText(installer.name, 120),
        location: sanitizePlainText(installer.location, 120),
        specialties: installer.specialties.map((value) => sanitizePlainText(value.toLowerCase(), 40)),
        bio: sanitizePlainText(installer.bio, 4000),
        instagram: installer.instagram ? sanitizePlainText(installer.instagram, 120) : null,
        tiktok: installer.tiktok ? sanitizePlainText(installer.tiktok, 120) : null,
        website: installer.website ? sanitizePlainText(installer.website, 500) : null,
        youtube: installer.youtube ? sanitizePlainText(installer.youtube, 200) : null,
        phone: installer.phone ? sanitizePlainText(installer.phone, 30) : null,
        email: installer.email ? sanitizePlainText(installer.email.toLowerCase(), 254) : null,
        slug,
        manage_token: manageToken,
      })
      .select('id, slug, name, created_at')
      .single();

    if (error) {
      console.error('Error creating installer profile:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You already have an installer profile. Use your dashboard to edit it.' },
          { status: 409, headers: rateLimit.headers },
        );
      }
      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Installer profile creation is currently unavailable.' },
          { status: 403, headers: rateLimit.headers },
        );
      }
      return NextResponse.json(
        { error: 'Failed to create installer profile.' },
        { status: 500, headers: rateLimit.headers },
      );
    }

    return NextResponse.json({ installer: data }, { status: 201, headers: rateLimit.headers });
  } catch (error) {
    console.error('Unhandled installers POST error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

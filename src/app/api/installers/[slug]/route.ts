import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit, sanitizePlainText, sanitizeSearchTerm } from '@/utils/api';

const PUBLIC_INSTALLER_COLUMNS = 'id, slug, created_at, name, location, specialties, bio, years_experience, is_available, instagram, tiktok, website, youtube, phone, email, avatar_url';

const installerUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    location: z.string().trim().min(2).max(120).optional(),
    specialties: z.array(z.string().trim().min(1).max(40)).min(1).max(8).optional(),
    bio: z.string().trim().max(4000).optional(),
    years_experience: z.number().int().min(0).max(60).optional(),
    is_available: z.boolean().optional(),
    instagram: z.string().trim().max(120).optional().or(z.literal('')),
    tiktok: z.string().trim().max(120).optional().or(z.literal('')),
    website: z.string().trim().url().max(500).optional().or(z.literal('')),
    youtube: z.string().trim().max(200).optional().or(z.literal('')),
    phone: z.string().trim().max(30).optional().or(z.literal('')),
    email: z.email().max(254).optional().or(z.literal('')),
    avatar_url: z.string().trim().url().max(500).optional().or(z.literal('')),
  })
  .strict();

function sanitizeSlug(rawSlug: string) {
  return sanitizeSearchTerm(rawSlug.toLowerCase(), 160).replace(/\s+/g, '-').replace(/-+/g, '-');
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const rateLimit = checkRateLimit(request, { key: 'installers:detail:get', maxRequests: 120, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
    );
  }

  try {
    const supabase = await createClient();
    const { slug } = await params;
    const safeSlug = sanitizeSlug(slug);

    const { data, error } = await supabase
      .from('installers')
      .select(PUBLIC_INSTALLER_COLUMNS)
      .eq('slug', safeSlug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Installer not found' }, { status: 404, headers: rateLimit.headers });
      }
      console.error('Error fetching installer:', error);
      return NextResponse.json(
        { error: 'Failed to fetch installer.' },
        { status: 500, headers: rateLimit.headers },
      );
    }

    return NextResponse.json({ installer: data }, { headers: rateLimit.headers });
  } catch (error) {
    console.error('Unhandled installer GET error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const rateLimit = checkRateLimit(request, { key: 'installers:detail:put', maxRequests: 30, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
    );
  }

  try {
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

    const parsed = installerUpdateSchema.safeParse(updatesPayload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid profile update payload.' },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const updates = parsed.data;
    const sanitizedUpdates: Record<string, unknown> = {
      ...updates,
      ...(updates.name ? { name: sanitizePlainText(updates.name, 120) } : {}),
      ...(updates.location ? { location: sanitizePlainText(updates.location, 120) } : {}),
      ...(updates.specialties
        ? { specialties: updates.specialties.map((value) => sanitizePlainText(value.toLowerCase(), 40)) }
        : {}),
      ...(updates.bio !== undefined ? { bio: sanitizePlainText(updates.bio, 4000) } : {}),
      ...(updates.instagram !== undefined
        ? { instagram: updates.instagram ? sanitizePlainText(updates.instagram, 120) : null }
        : {}),
      ...(updates.tiktok !== undefined
        ? { tiktok: updates.tiktok ? sanitizePlainText(updates.tiktok, 120) : null }
        : {}),
      ...(updates.website !== undefined
        ? { website: updates.website ? sanitizePlainText(updates.website, 500) : null }
        : {}),
      ...(updates.youtube !== undefined
        ? { youtube: updates.youtube ? sanitizePlainText(updates.youtube, 200) : null }
        : {}),
      ...(updates.phone !== undefined
        ? { phone: updates.phone ? sanitizePlainText(updates.phone, 30) : null }
        : {}),
      ...(updates.email !== undefined
        ? { email: updates.email ? sanitizePlainText(updates.email.toLowerCase(), 254) : null }
        : {}),
      ...(updates.avatar_url !== undefined
        ? { avatar_url: updates.avatar_url ? sanitizePlainText(updates.avatar_url, 500) : null }
        : {}),
    };

    const { data, error } = await supabase
      .from('installers')
      .update(sanitizedUpdates)
      .eq('slug', safeSlug)
      .eq('manage_token', manageToken)
      .select(PUBLIC_INSTALLER_COLUMNS)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Installer not found or unauthorized.' },
          { status: 404, headers: rateLimit.headers },
        );
      }
      console.error('Error updating installer profile:', error);
      return NextResponse.json(
        { error: 'Failed to update installer profile.' },
        { status: 500, headers: rateLimit.headers },
      );
    }

    return NextResponse.json({ installer: data }, { headers: rateLimit.headers });
  } catch (error) {
    console.error('Unhandled installer PUT error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

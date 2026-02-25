import { randomBytes } from 'crypto';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sanitizePlainText, sanitizeSearchTerm } from '@/utils/api';

const installerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  specialties: z.array(z.string().trim().min(1).max(40)).min(1).max(8),
  bio: z.string().trim().max(4000).optional().or(z.literal('')),
  years_experience: z.number().int().min(0).max(60).nullable().optional(),
  is_available: z.boolean().optional(),
  instagram: z.string().trim().max(120).optional().or(z.literal('')),
  tiktok: z.string().trim().max(120).optional().or(z.literal('')),
  website: z.string().trim().max(500).optional().or(z.literal('')),
  youtube: z.string().trim().max(200).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().trim().email().max(254).optional().or(z.literal('')),
  avatar_url: z.string().trim().url().max(500).optional().or(z.literal('')),
});

function makeInstallerSlug(name: string) {
  const base = sanitizeSearchTerm(name.toLowerCase(), 80)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${randomBytes(3).toString('hex')}`;
}

async function assertInstallerAccount() {
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

  if (profile?.account_type !== 'installer') {
    return { supabase, user: null as null, error: NextResponse.json({ error: 'Installer account required.' }, { status: 403 }) };
  }

  return { supabase, user: authData.user, error: null as NextResponse<unknown> | null };
}

export async function GET() {
  const auth = await assertInstallerAccount();
  if (auth.error) return auth.error;
  if (!auth.user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { data, error } = await auth.supabase
    .from('installers')
    .select('id, slug, created_at, name, location, specialties, bio, years_experience, is_available, instagram, tiktok, website, youtube, phone, email, avatar_url')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to load installer profile.' }, { status: 500 });
  }

  return NextResponse.json({ installer: data ?? null });
}

export async function PUT(request: NextRequest) {
  const auth = await assertInstallerAccount();
  if (auth.error) return auth.error;
  if (!auth.user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = installerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid installer profile fields.' }, { status: 400 });
  }

  const installer = parsed.data;

  const basePayload = {
    name: sanitizePlainText(installer.name, 120),
    location: sanitizePlainText(installer.location, 120),
    specialties: installer.specialties.map((value) => sanitizePlainText(value.toLowerCase(), 40)),
    bio: installer.bio ? sanitizePlainText(installer.bio, 4000) : '',
    years_experience: installer.years_experience ?? null,
    is_available: installer.is_available ?? true,
    instagram: installer.instagram ? sanitizePlainText(installer.instagram, 120) : null,
    tiktok: installer.tiktok ? sanitizePlainText(installer.tiktok, 120) : null,
    website: installer.website ? sanitizePlainText(installer.website, 500) : null,
    youtube: installer.youtube ? sanitizePlainText(installer.youtube, 200) : null,
    phone: installer.phone ? sanitizePlainText(installer.phone, 30) : null,
    email: installer.email ? sanitizePlainText(installer.email.toLowerCase(), 254) : null,
    avatar_url: installer.avatar_url ? sanitizePlainText(installer.avatar_url, 500) : null,
  };

  const { data: existing } = await auth.supabase
    .from('installers')
    .select('id')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await auth.supabase
      .from('installers')
      .update(basePayload)
      .eq('user_id', auth.user.id)
      .select('id, slug, created_at, name, location, specialties, bio, years_experience, is_available, instagram, tiktok, website, youtube, phone, email, avatar_url')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update installer profile.' }, { status: 500 });
    }

    return NextResponse.json({ installer: data });
  }

  const slug = makeInstallerSlug(basePayload.name);
  const manageToken = randomBytes(24).toString('hex');

  const { data, error } = await auth.supabase
    .from('installers')
    .insert({
      ...basePayload,
      user_id: auth.user.id,
      slug,
      manage_token: manageToken,
    })
    .select('id, slug, created_at, name, location, specialties, bio, years_experience, is_available, instagram, tiktok, website, youtube, phone, email, avatar_url')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create installer profile.' }, { status: 500 });
  }

  return NextResponse.json({ installer: data });
}

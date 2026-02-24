import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const specialty = searchParams.get('specialty') || '';
    const availability = searchParams.get('availability');
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10), 1), 50);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('installers')
      .select('*');

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
      return NextResponse.json({ error: 'Failed to fetch installers' }, { status: 500 });
    }

    return NextResponse.json({ installers: data });
  } catch (error) {
    console.error('Unhandled installers GET error:', error);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const name = (body.name || '').trim();
    const location = (body.location || '').trim();
    const bio = (body.bio || '').trim();

    const specialties = Array.isArray(body.specialties)
      ? body.specialties.map((value: string) => String(value).trim()).filter(Boolean)
      : [];

    if (!name || !location || specialties.length === 0 || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields: name, location, specialties, bio' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('installers')
      .insert({
        name,
        location,
        specialties,
        bio,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating installer profile:', error);
      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Installer profile creation is blocked by Supabase RLS policy. Enable INSERT for this table.' },
          { status: 403 },
        );
      }
      return NextResponse.json({ error: 'Failed to create installer profile' }, { status: 500 });
    }

    return NextResponse.json({ installer: data }, { status: 201 });
  } catch (error) {
    console.error('Unhandled installers POST error:', error);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;

  const location = searchParams.get('location') || '';
  const trade = searchParams.get('trade') || '';
  const experience = searchParams.get('experience') || '';
  const availability = searchParams.get('availability'); // 'true' or null
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('installers')
    .select('*');

  if (location) {
    query = query.or(`location_city.ilike.%${location}%,location_state.ilike.%${location}%`);
  }
  if (trade) {
    query = query.contains('trades', [trade]);
  }
  if (experience) {
    // This will need more complex logic based on the spec's experience ranges
    // For now, a simple equality or greater than
    if (experience === '<1') {
      query = query.lt('years_experience', 1);
    } else if (experience === '1-2') {
      query = query.gte('years_experience', 1).lte('years_experience', 2);
    } else if (experience === '3-5') {
      query = query.gte('years_experience', 3).lte('years_experience', 5);
    } else if (experience === '6-10') {
      query = query.gte('years_experience', 6).lte('years_experience', 10);
    } else if (experience === '10+') {
      query = query.gte('years_experience', 10);
    }
  }
  if (availability === 'true') {
    query = query.eq('is_available', true);
  }

  // Sorting
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'experience-desc') {
    query = query.order('years_experience', { ascending: false });
  } else if (sort === 'name-asc') {
    query = query.order('name', { ascending: true });
  }

  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching installers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Implement total count for pagination

  return NextResponse.json({ installers: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    name,
    email,
    location_city,
    location_state,
    trades,
    years_experience,
    bio,
    certifications,
    portfolio_urls,
    resume_url,
    is_available,
  } = body;

  // Basic validation
  if (!name || !email || !location_city || !location_state || !trades || trades.length === 0 || !years_experience || !bio) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Generate a simple slug
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '')}-${location_city.toLowerCase().replace(/[^a-z0-9]+/g, '')}-${location_state.toLowerCase()}-${Math.random().toString(36).substring(2, 8)}`;

  // Generate a manage token
  const manage_token = Math.random().toString(36).substring(2); // Simple token for now

  const { data, error } = await supabase
    .from('installers')
    .insert({
      name,
      email,
      location_city,
      location_state,
      trades,
      years_experience,
      bio,
      certifications,
      portfolio_urls,
      resume_url,
      is_available,
      slug,
      manage_token,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating installer profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Send email with manage link using Resend

  return NextResponse.json({ installer: data }, { status: 201 });
}

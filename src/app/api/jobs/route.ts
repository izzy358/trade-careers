
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;

  const q = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const trade = searchParams.get('trade') || '';
  const jobType = searchParams.get('type') || '';
  const payMin = searchParams.get('payMin');
  const payMax = searchParams.get('payMax');
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('jobs')
    .select('*')
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
  if (jobType) {
    query = query.eq('job_type', jobType);
  }
  if (payMin) {
    query = query.gte('pay_min', parseInt(payMin));
  }
  if (payMax) {
    query = query.lte('pay_max', parseInt(payMax));
  }

  // Sorting
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'closest' && location) {
    // Requires lat/lng for jobs and user's location, will implement later with geocoding
    // For now, closest will just be newest if no proper location data exists
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'highest-pay') {
    query = query.order('pay_max', { ascending: false }).order('pay_min', { ascending: false });
  }

  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Implement total count for pagination

  return NextResponse.json({ jobs: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    title,
    company_name,
    company_email,
    company_logo_url,
    location_city,
    location_state,
    trades,
    job_type,
    pay_min,
    pay_max,
    pay_type,
    description,
    requirements,
    how_to_apply,
  } = body;

  // Basic validation (more robust validation will be needed on the client-side and potentially here)
  if (!title || !company_name || !company_email || !location_city || !location_state || !trades || trades.length === 0 || !job_type || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Generate a simple slug (can be made more robust)
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '')}-${location_city.toLowerCase().replace(/[^a-z0-9]+/g, '')}-${location_state.toLowerCase()}-${Math.random().toString(36).substring(2, 8)}`;

  // Generate a manage token
  const manage_token = Math.random().toString(36).substring(2); // Simple token for now

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title,
      company_name,
      company_email,
      company_logo_url,
      location_city,
      location_state,
      trades,
      job_type,
      pay_min,
      pay_max,
      pay_type,
      description,
      requirements,
      how_to_apply,
      slug,
      manage_token,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Send email with manage link using Resend

  return NextResponse.json({ job: data }, { status: 201 });
}

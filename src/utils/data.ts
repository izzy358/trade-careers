import { createClient } from './supabase/server';

export async function getJobs({
  q,
  location,
  trade,
  jobType,
  payMin,
  payMax,
  sort,
  page,
  limit,
  is_featured,
}: {
  q?: string;
  location?: string;
  trade?: string;
  jobType?: string;
  payMin?: string;
  payMax?: string;
  sort?: string;
  page?: number;
  limit?: number;
  is_featured?: boolean;
} = {}) {
  const supabase = await createClient();

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
    query = query.gte('pay_min', parseInt(payMin, 10));
  }
  if (payMax) {
    query = query.lte('pay_max', parseInt(payMax, 10));
  }

  if (is_featured !== undefined) {
    query = query.eq('is_featured', is_featured);
  }

  if (sort === 'highest-pay') {
    query = query.order('pay_max', { ascending: false }).order('pay_min', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const currentPage = page || 1;
  const itemsPerPage = limit || 20;
  const offset = (currentPage - 1) * itemsPerPage;

  const { data, error } = await query.range(offset, offset + itemsPerPage - 1);

  if (error) {
    console.error('Error fetching jobs:', error);
    return { jobs: [], error: error.message };
  }

  return { jobs: data, error: null };
}

export async function getInstallers({
  q,
  location,
  specialty,
  availability,
  sort,
  page,
  limit,
}: {
  q?: string;
  location?: string;
  specialty?: string;
  availability?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
} = {}) {
  const supabase = await createClient();

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
  if (availability) {
    query = query.eq('is_available', true);
  }

  if (sort === 'name-asc') {
    query = query.order('name', { ascending: true });
  } else if (sort === 'experience-desc') {
    query = query.order('years_experience', { ascending: false, nullsFirst: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const currentPage = page || 1;
  const itemsPerPage = limit || 12;
  const offset = (currentPage - 1) * itemsPerPage;

  const { data, error } = await query.range(offset, offset + itemsPerPage - 1);

  if (error) {
    console.error('Error fetching installers:', error);
    return { installers: [], error: error.message };
  }

  return { installers: data, error: null };
}

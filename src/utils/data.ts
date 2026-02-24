
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
    query = query.gte('pay_min', parseInt(payMin));
  }
  if (payMax) {
    query = query.lte('pay_max', parseInt(payMax));
  }

  if (is_featured !== undefined) {
    query = query.eq('is_featured', is_featured);
  }

  // Sorting
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'highest-pay') {
    query = query.order('pay_max', { ascending: false }).order('pay_min', { ascending: false });
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
  trade,
  experience,
  availability,
  sort,
  page,
  limit,
}: {
  q?: string;
  location?: string;
  trade?: string;
  experience?: string;
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
    query = query.or(`location_city.ilike.%${location}%,location_state.ilike.%${location}%`);
  }
  if (trade) {
    query = query.contains('trades', [trade]);
  }
  if (experience) {
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
  if (availability) {
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

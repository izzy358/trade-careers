import { createClient } from './supabase/server';
import { sanitizeSearchTerm } from './api';
import cityCoordinates from '@/data/us-city-coordinates.json';

type CityCoordinate = {
  city: string;
  state: string;
  lat: number;
  lng: number;
};

type Coordinates = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS_MILES = 3958.8;
const US_CITY_COORDINATES = cityCoordinates as CityCoordinate[];

function normalizeCityStatePart(value: string) {
  return value.trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ');
}

function toCityStateKey(city: string, state: string) {
  return `${normalizeCityStatePart(city)}|${state.trim().toUpperCase()}`;
}

const cityStateCoordinates = new Map<string, Coordinates>();
const cityCoordinatesByName = new Map<string, Coordinates>();

for (const entry of US_CITY_COORDINATES) {
  const point = { lat: entry.lat, lng: entry.lng };
  cityStateCoordinates.set(toCityStateKey(entry.city, entry.state), point);

  const cityKey = normalizeCityStatePart(entry.city);
  if (!cityCoordinatesByName.has(cityKey)) {
    cityCoordinatesByName.set(cityKey, point);
  }
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function haversineMiles(a: Coordinates, b: Coordinates) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinHalfDLat = Math.sin(dLat / 2);
  const sinHalfDLng = Math.sin(dLng / 2);
  const aa =
    sinHalfDLat * sinHalfDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfDLng * sinHalfDLng;

  return 2 * EARTH_RADIUS_MILES * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

function getCoordinatesFromSearchLocation(location: string): Coordinates | null {
  const trimmed = location.trim();
  if (!trimmed) {
    return null;
  }

  const commaSplit = trimmed.split(',');
  if (commaSplit.length >= 2) {
    const cityPart = commaSplit[0].trim();
    const statePart = commaSplit[1].trim().slice(0, 2).toUpperCase();
    const exact = cityStateCoordinates.get(toCityStateKey(cityPart, statePart));
    if (exact) {
      return exact;
    }
  }

  const trailingStateMatch = trimmed.match(/^(.*?)[\s,]+([A-Za-z]{2})$/);
  if (trailingStateMatch) {
    const cityPart = trailingStateMatch[1].trim();
    const statePart = trailingStateMatch[2].toUpperCase();
    const exact = cityStateCoordinates.get(toCityStateKey(cityPart, statePart));
    if (exact) {
      return exact;
    }
  }

  return cityCoordinatesByName.get(normalizeCityStatePart(trimmed)) ?? null;
}

function getCoordinatesFromJobLocation(city: string, state: string): Coordinates | null {
  return cityStateCoordinates.get(toCityStateKey(city, state)) ?? null;
}

export async function getJobs({
  q,
  location,
  radius,
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
  radius?: string;
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
  const parsedRadius = radius ? parseInt(radius, 10) : NaN;
  const shouldUseRadius =
    Boolean(location && location.trim().length > 0) &&
    Number.isFinite(parsedRadius) &&
    parsedRadius > 0;

  let query = supabase
    .from('jobs')
    .select('*')
    .eq('status', 'active');

  query = query.or('expires_at.is.null,expires_at.gt.now()');

  if (q) {
    const safeQ = sanitizeSearchTerm(q);
    if (safeQ) {
      query = query.or(`title.ilike.%${safeQ}%,description.ilike.%${safeQ}%,company_name.ilike.%${safeQ}%`);
    }
  }
  if (location && !shouldUseRadius) {
    const safeLocation = sanitizeSearchTerm(location);
    if (safeLocation) {
      query = query.or(`location_city.ilike.%${safeLocation}%,location_state.ilike.%${safeLocation}%`);
    }
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

  if (shouldUseRadius) {
    const center = getCoordinatesFromSearchLocation(location!);
    if (!center) {
      return { jobs: [], error: null };
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching jobs:', error);
      return { jobs: [], error: error.message };
    }

    const filteredJobs = (data ?? []).filter((job: { location_city: string; location_state: string }) => {
      const jobCoordinates = getCoordinatesFromJobLocation(job.location_city, job.location_state);
      if (!jobCoordinates) {
        return false;
      }
      return haversineMiles(center, jobCoordinates) <= parsedRadius;
    });

    return {
      jobs: filteredJobs.slice(offset, offset + itemsPerPage),
      error: null,
    };
  }

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
    const safeQ = sanitizeSearchTerm(q);
    if (safeQ) {
      query = query.or(`name.ilike.%${safeQ}%,bio.ilike.%${safeQ}%`);
    }
  }
  if (location) {
    const safeLocation = sanitizeSearchTerm(location);
    if (safeLocation) {
      query = query.ilike('location', `%${safeLocation}%`);
    }
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

export async function getStats() {
  const supabase = await createClient();

  const [jobsResult, installersResult, statesResult] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('installers').select('id', { count: 'exact', head: true }),
    supabase.from('jobs').select('location_state').eq('status', 'active'),
  ]);

  const jobCount = jobsResult.count ?? 0;
  const installerCount = installersResult.count ?? 0;
  const uniqueStates = new Set((statesResult.data ?? []).map((j: { location_state: string }) => j.location_state)).size;

  return { jobCount, installerCount, stateCount: uniqueStates, tradeCount: 6 };
}

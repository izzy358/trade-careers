import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, sanitizeSearchTerm } from '@/utils/api';

const geocodeSchema = z.object({
  location: z.string().trim().min(2).max(120),
});

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, { key: 'geocode:post', maxRequests: 40, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
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

  const parsed = geocodeSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Location is required.' },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const apiKey = process.env.OPENCAGE_API_KEY;
  if (!apiKey) {
    console.error('OPENCAGE_API_KEY is not set');
    return NextResponse.json(
      { error: 'Server configuration error.' },
      { status: 500, headers: rateLimit.headers },
    );
  }

  const safeLocation = sanitizeSearchTerm(parsed.data.location, 120);

  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(safeLocation)}&key=${apiKey}`,
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return NextResponse.json({ lat, lng }, { headers: rateLimit.headers });
    }

    return NextResponse.json({ error: 'Location not found.' }, { status: 404, headers: rateLimit.headers });
  } catch (error) {
    console.error('Error geocoding location:', error);
    return NextResponse.json(
      { error: 'Failed to geocode location.' },
      { status: 500, headers: rateLimit.headers },
    );
  }
}

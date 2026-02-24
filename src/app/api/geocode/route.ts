
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { location } = await request.json();

  if (!location) {
    return NextResponse.json({ error: 'Location is required' }, { status: 400 });
  }

  const apiKey = process.env.OPENCAGE_API_KEY;
  if (!apiKey) {
    console.error('OPENCAGE_API_KEY is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return NextResponse.json({ lat, lng });
    } else {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error geocoding location:', error);
    return NextResponse.json({ error: 'Failed to geocode location' }, { status: 500 });
  }
}

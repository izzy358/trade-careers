import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    const { data, error } = await supabase
      .from('installers')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Installer not found' }, { status: 404 });
      }
      console.error('Error fetching installer:', error);
      return NextResponse.json({ error: 'Failed to fetch installer' }, { status: 500 });
    }

    return NextResponse.json({ installer: data });
  } catch (error) {
    console.error('Unhandled installer GET error:', error);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    const body = await request.json();
    const { manage_token, ...updates } = body;

    if (!manage_token || typeof manage_token !== 'string') {
      return NextResponse.json({ error: 'Authorization token is required' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('installers')
      .update(updates)
      .eq('slug', slug)
      .eq('manage_token', manage_token)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Installer not found or unauthorized' }, { status: 404 });
      }
      console.error('Error updating installer profile:', error);
      return NextResponse.json({ error: 'Failed to update installer profile' }, { status: 500 });
    }

    return NextResponse.json({ installer: data });
  } catch (error) {
    console.error('Unhandled installer PUT error:', error);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

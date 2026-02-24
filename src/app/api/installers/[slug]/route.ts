
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data, error } = await supabase
    .from('installers')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return NextResponse.json({ error: 'Installer not found' }, { status: 404 });
    }
    console.error('Error fetching installer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ installer: data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { slug } = await params;
  const body = await request.json();
  const { manage_token, ...updates } = body; // Extract manage_token and other updates

  if (!manage_token) {
    return NextResponse.json({ error: 'Authorization token is required' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('installers')
    .update(updates)
    .eq('slug', slug)
    .eq('manage_token', manage_token)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found with matching slug and token
      return NextResponse.json({ error: 'Installer not found or unauthorized' }, { status: 404 });
    }
    console.error('Error updating installer profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ installer: data });
}

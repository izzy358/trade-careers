import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { slug } = await params;
  const body = await request.json();

  const { name, email, phone, message, resume_url } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields: name, email, message' }, { status: 400 });
  }

  const { data: jobData, error: jobError } = await supabase
    .from('jobs')
    .select('id')
    .eq('slug', slug)
    .single();

  if (jobError) {
    if (jobError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    console.error('Error fetching job for application:', jobError);
    return NextResponse.json({ error: jobError.message }, { status: 500 });
  }

  const { data: applicationData, error: applicationError } = await supabase
    .from('applications')
    .insert({
      job_id: jobData.id,
      name,
      email,
      phone: phone || null,
      message,
      resume_url: resume_url || '',
    })
    .select()
    .single();

  if (applicationError) {
    console.error('Error saving application:', applicationError);
    return NextResponse.json({ error: applicationError.message }, { status: 500 });
  }

  return NextResponse.json({ application: applicationData, message: 'Application submitted successfully' }, { status: 201 });
}

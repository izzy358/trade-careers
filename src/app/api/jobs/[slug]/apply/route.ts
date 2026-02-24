
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { slug } = await params;
  const body = await request.json();

  const {
    applicant_name,
    applicant_email,
    message,
    resume_url, // URL after upload to Supabase Storage
  } = body;

  // Basic validation
  if (!applicant_name || !applicant_email || !message) {
    return NextResponse.json({ error: 'Missing required fields: name, email, message' }, { status: 400 });
  }

  // First, get the job_id from the slug
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

  const job_id = jobData.id;

  const { data: applicationData, error: applicationError } = await supabase
    .from('applications')
    .insert({
      job_id,
      applicant_name,
      applicant_email,
      message,
      resume_url,
    })
    .select()
    .single();

  if (applicationError) {
    console.error('Error saving application:', applicationError);
    return NextResponse.json({ error: applicationError.message }, { status: 500 });
  }

  // TODO: Send email to employer (employerEmail) with application details
  // TODO: Send confirmation email to applicant (applicant_email)

  return NextResponse.json({ application: applicationData, message: 'Application submitted successfully' }, { status: 201 });
}

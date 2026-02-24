
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const folder = formData.get('folder') as string || 'misc'; // e.g., 'company_logos', 'portfolio_images', 'resumes'

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('wrap-careers-assets') // TODO: Make bucket name configurable (env var)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('wrap-careers-assets')
    .getPublicUrl(filePath);

  return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
}

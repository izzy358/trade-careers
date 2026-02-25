import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { checkRateLimit, sanitizeSearchTerm } from '@/utils/api';

const ALLOWED_FOLDERS = new Set(['misc', 'company_logos', 'portfolio_images', 'resumes']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, { key: 'upload:post', maxRequests: 15, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: rateLimit.headers },
    );
  }

  const supabase = await createClient();
  const formData = await request.formData();
  const file = formData.get('file');
  const folderInput = typeof formData.get('folder') === 'string' ? formData.get('folder') : 'misc';
  const sanitizedFolder = sanitizeSearchTerm(folderInput || 'misc', 40).replace(/\s+/g, '_').toLowerCase();
  const folder = ALLOWED_FOLDERS.has(sanitizedFolder) ? sanitizedFolder : 'misc';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400, headers: rateLimit.headers });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File is too large. Maximum size is 10MB.' },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const fileExtension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : null;
  const safeExtension = fileExtension && /^[a-z0-9]+$/.test(fileExtension) ? fileExtension : 'bin';
  const fileName = `${uuidv4()}.${safeExtension}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from('wrap-careers-assets')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Unable to upload file right now.' },
      { status: 500, headers: rateLimit.headers },
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from('wrap-careers-assets')
    .getPublicUrl(filePath);

  return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201, headers: rateLimit.headers });
}

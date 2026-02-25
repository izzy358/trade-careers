import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('jobs').select('id').limit(1);

    if (error) {
      return NextResponse.json({ ok: false, error: 'Database connection failed.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected server error.' }, { status: 500 });
  }
}

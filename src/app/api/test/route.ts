import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  console.log('=== SUPABASE TEST ===');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    const supabase = await createClient();
    console.log('Client created successfully');
    
    // Test basic connection
    const { data, error, count } = await supabase
      .from('jobs')
      .select('id, title', { count: 'exact' })
      .limit(1);
    
    console.log('Query result:', { data, error, count });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error,
        env_check: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          has_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      count,
      sample: data,
      env_check: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });
    
  } catch (err) {
    console.error('Catch block error:', err);
    return NextResponse.json({ 
      error: 'Catch block error',
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : null,
      env_check: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    }, { status: 500 });
  }
}
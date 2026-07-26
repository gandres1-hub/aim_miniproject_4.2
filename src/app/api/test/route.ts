import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/supabaseClient';

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('venues').select('*');

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, venues: data });
}
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/supabaseClient';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.body || !body.author_role) {
    return NextResponse.json(
      { success: false, error: 'author_role and body are required' },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('comments')
    .insert({ proposal_id: id, author_role: body.author_role, body: body.body })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, comment: data });
}
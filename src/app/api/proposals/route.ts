import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/supabaseClient';
import type { NewProposalInput } from '@/lib/types';

export async function POST(request: Request) {
  const body: Partial<NewProposalInput> = await request.json();

  // Basic required-field validation (spec.md §8)
  const requiredFields: (keyof NewProposalInput)[] = [
    'title',
    'objectives',
    'description',
    'schedule_start',
    'schedule_end',
    'target_audience',
    'venue',
    'budget_amount',
    'submitter_name',
  ];

  const missing = requiredFields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    );
  }

  if (new Date(body.schedule_start!) >= new Date(body.schedule_end!)) {
    return NextResponse.json(
      { success: false, error: 'schedule_start must be before schedule_end' },
      { status: 400 }
    );
  }

  if (body.budget_amount! > 0 && !body.funding_source) {
    return NextResponse.json(
      { success: false, error: 'funding_source is required when budget_amount > 0' },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('activity_proposals')
    .insert({ ...body, status: 'submitted' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, proposal: data });
}

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('activity_proposals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, proposals: data });
}
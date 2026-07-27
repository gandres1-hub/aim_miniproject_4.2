import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/supabaseClient';

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('activity_proposals')
    .select('status, budget_amount, has_venue_conflict');

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const summary = {
    pending_count: data.filter((p) => p.status === 'under_review' || p.status === 'submitted').length,
    revision_requested_count: data.filter((p) => p.status === 'revision_requested').length,
    approved_count: data.filter((p) => p.status === 'approved').length,
    rejected_count: data.filter((p) => p.status === 'rejected').length,
    conflict_count: data.filter((p) => p.has_venue_conflict).length,
    total_requested: data.reduce((sum, p) => sum + Number(p.budget_amount), 0),
    total_approved: data
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + Number(p.budget_amount), 0),
  };

  return NextResponse.json({ success: true, summary });
}
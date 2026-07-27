import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/supabaseClient';
import { findVenueConflicts } from '@/lib/logic/venueConflicts';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();

  const { data: proposal, error: proposalError } = await supabase
    .from('activity_proposals')
    .select('*')
    .eq('id', id)
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 });
  }

  const { data: reviews } = await supabase
    .from('ai_reviews')
    .select('*')
    .eq('proposal_id', id)
    .order('created_at', { ascending: false })
    .limit(1);

  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('proposal_id', id)
    .order('created_at', { ascending: true });

  return NextResponse.json({
    success: true,
    proposal,
    review: reviews?.[0] ?? null,
    comments: comments ?? [],
  });
}

const VALID_STATUSES = ['submitted', 'under_review', 'revision_requested', 'approved', 'rejected'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const updatePayload: Record<string, unknown> = {
    status: body.status,
    updated_at: new Date().toISOString(),
  };

  if (body.status === 'approved') {
    const { data: current } = await supabase
      .from('activity_proposals')
      .select('venue, schedule_start, schedule_end')
      .eq('id', id)
      .single();

    if (current) {
      const conflicts = await findVenueConflicts(
        supabase,
        current.venue,
        current.schedule_start,
        current.schedule_end,
        id
      );

      if (conflicts.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot approve — venue conflict with an already-approved proposal.',
            conflicts: conflicts.map((c) => ({
              title: c.title,
              schedule_start: c.schedule_start,
              schedule_end: c.schedule_end,
            })),
          },
          { status: 409 }
        );
      }
    }
  }

  const { data, error } = await supabase
    .from('activity_proposals')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, proposal: data });
}

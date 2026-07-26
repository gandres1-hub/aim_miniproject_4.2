import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/supabaseClient';
import { reviewProposal } from '@/lib/ai/reviewProposal';
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

  // 1. Insert the proposal
  const { data: proposal, error: insertError } = await supabase
    .from('activity_proposals')
    .insert({ ...body, status: 'submitted' })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
  }

  // 2. Run the AI review
  const review = await reviewProposal(body);

  // 3. Save the review
  const { error: reviewError } = await supabase.from('ai_reviews').insert({
    proposal_id: proposal.id,
    completeness_flags: review.completeness_flags,
    consistency_flags: review.consistency_flags,
    draft_feedback: review.draft_feedback,
  });

  if (reviewError) {
    console.error('Failed to save AI review:', reviewError.message);
    // Don't fail the whole request — the proposal itself was created successfully
  }

  // 4. Move status to under_review now that the AI has looked at it
  const { data: updatedProposal, error: updateError } = await supabase
    .from('activity_proposals')
    .update({ status: 'under_review' })
    .eq('id', proposal.id)
    .select()
    .single();

  if (updateError) {
    console.error('Failed to update status:', updateError.message);
  }

  return NextResponse.json({
    success: true,
    proposal: updatedProposal ?? proposal,
    review,
  });
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
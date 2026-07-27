import type { SupabaseClient } from '@supabase/supabase-js';

export interface ConflictingProposal {
  id: string;
  title: string;
  schedule_start: string;
  schedule_end: string;
}

export async function findVenueConflicts(
  supabase: SupabaseClient,
  venue: string,
  scheduleStart: string,
  scheduleEnd: string,
  excludeId?: string
): Promise<ConflictingProposal[]> {
  let query = supabase
    .from('activity_proposals')
    .select('id, title, schedule_start, schedule_end')
    .ilike('venue', venue)
    .eq('status', 'approved');

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Venue conflict check failed:', error?.message);
    return [];
  }

  const newStart = new Date(scheduleStart).getTime();
  const newEnd = new Date(scheduleEnd).getTime();

  return data.filter((ap) => {
    const existingStart = new Date(ap.schedule_start).getTime();
    const existingEnd = new Date(ap.schedule_end).getTime();
    return !(newEnd <= existingStart || newStart >= existingEnd);
  });
}

export async function checkVenueConflict(
  supabase: SupabaseClient,
  venue: string,
  scheduleStart: string,
  scheduleEnd: string,
  excludeId?: string
): Promise<boolean> {
  const conflicts = await findVenueConflicts(supabase, venue, scheduleStart, scheduleEnd, excludeId);
  return conflicts.length > 0;
}
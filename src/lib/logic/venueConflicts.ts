import type { SupabaseClient } from '@supabase/supabase-js';

export async function checkVenueConflict(
  supabase: SupabaseClient,
  venue: string,
  scheduleStart: string,
  scheduleEnd: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from('activity_proposals')
    .select('id, schedule_start, schedule_end')
    .ilike('venue', venue)
    .eq('status', 'approved');

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Venue conflict check failed:', error?.message);
    return false; // fail open — don't block submission on a check error
  }

  const newStart = new Date(scheduleStart).getTime();
  const newEnd = new Date(scheduleEnd).getTime();

  return data.some((ap) => {
    const existingStart = new Date(ap.schedule_start).getTime();
    const existingEnd = new Date(ap.schedule_end).getTime();
    // Overlap unless one ends before the other starts
    return !(newEnd <= existingStart || newStart >= existingEnd);
  });
}
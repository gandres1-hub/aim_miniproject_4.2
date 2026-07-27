import { describe, it, expect, vi } from 'vitest';
import { findVenueConflicts } from '@/lib/logic/venueConflicts';

function mockSupabase(returnedRows: unknown[]) {
  return {
    from: () => ({
      select: () => ({
        ilike: () => ({
          eq: () => ({
            neq: () => Promise.resolve({ data: returnedRows, error: null }),
          }),
        }),
      }),
    }),
  } as never;
}

describe('findVenueConflicts', () => {
  it('detects an overlapping time range at the same venue', async () => {
    const supabase = mockSupabase([
      {
        id: 'other-1',
        title: 'Existing Event',
        schedule_start: '2026-08-27T00:00:00Z',
        schedule_end: '2026-08-27T12:00:00Z',
      },
    ]);

    const conflicts = await findVenueConflicts(
      supabase,
      'Auditorium',
      '2026-08-27T06:00:00Z',
      '2026-08-27T18:00:00Z',
      'new-id'
    );

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].title).toBe('Existing Event');
  });

  it('returns no conflicts when time ranges do not overlap', async () => {
    const supabase = mockSupabase([
      {
        id: 'other-1',
        title: 'Morning Event',
        schedule_start: '2026-08-27T06:00:00Z',
        schedule_end: '2026-08-27T09:00:00Z',
      },
    ]);

    const conflicts = await findVenueConflicts(
      supabase,
      'Auditorium',
      '2026-08-27T10:00:00Z',
      '2026-08-27T12:00:00Z',
      'new-id'
    );

    expect(conflicts).toHaveLength(0);
  });
});
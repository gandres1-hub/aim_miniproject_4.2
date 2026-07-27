import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/db/supabaseClient';
import type { ActivityProposal } from '@/lib/types';
import { calculateFundTotals } from '@/lib/logic/fundTotals';

export const dynamic = 'force-dynamic';
async function getProposals(): Promise<ActivityProposal[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('activity_proposals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load proposals:', error.message);
    return [];
  }

  return data as ActivityProposal[];
}

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-gray-200 text-gray-800',
  under_review: 'bg-yellow-200 text-yellow-800',
  revision_requested: 'bg-orange-200 text-orange-800',
  approved: 'bg-green-200 text-green-800',
  rejected: 'bg-red-200 text-red-800',
};

export default async function DashboardPage() {
  const proposals = await getProposals();

  const { totalRequested, totalApproved } = calculateFundTotals(proposals);
  const conflictCount = proposals.filter((p) => p.has_venue_conflict).length;

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activity Proposals</h1>
        <Link
          href="/proposals/new"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + New Proposal
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded p-3">
          <p className="text-xs text-gray-500">Total Requested</p>
          <p className="text-lg font-semibold">₱{totalRequested.toLocaleString()}</p>
        </div>
        <div className="border rounded p-3">
          <p className="text-xs text-gray-500">Total Approved</p>
          <p className="text-lg font-semibold">₱{totalApproved.toLocaleString()}</p>
        </div>
        <div className="border rounded p-3">
          <p className="text-xs text-gray-500">Venue Conflicts</p>
          <p className="text-lg font-semibold">{conflictCount}</p>
        </div>
      </div>
      {proposals.length === 0 ? (
        <p className="text-gray-500">No proposals yet.</p>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <Link
               key={p.id}
               href={`/proposals/${p.id}`}
               className="border rounded p-4 flex justify-between items-center hover:bg-gray-50"
       >
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-500">
                  {p.venue} · {p.submitter_name} · ₱{p.budget_amount.toLocaleString()}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[p.status] ?? 'bg-gray-100'}`}
              >
                {p.status.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
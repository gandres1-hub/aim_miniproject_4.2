import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/db/supabaseClient';
import type { ActivityProposal } from '@/lib/types';

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

      {proposals.length === 0 ? (
        <p className="text-gray-500">No proposals yet.</p>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <div key={p.id} className="border rounded p-4 flex justify-between items-center">
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
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
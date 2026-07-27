'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { ActivityProposal } from '@/lib/types';

interface AIReview {
  completeness_flags: { field: string; issue: string }[];
  consistency_flags: { issue: string }[];
  draft_feedback: string;
}

interface Comment {
  id: string;
  author_role: string;
  body: string;
  created_at: string;
}

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [proposal, setProposal] = useState<ActivityProposal | null>(null);
  const [review, setReview] = useState<AIReview | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/proposals/${id}`);
    const data = await res.json();
    if (data.success) {
      setProposal(data.proposal);
      setReview(data.review);
      setComments(data.comments);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(status: string) {
    setActionLoading(true);
    setActionError(null);
    const res = await fetch(`/api/proposals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();

    if (!data.success) {
      const conflictText = data.conflicts
        ?.map((c: { title: string }) => c.title)
        .join(', ');
      setActionError(
        conflictText ? `${data.error} Conflicts with: ${conflictText}` : data.error
      );
      setActionLoading(false);
      return;
    }

    await load();
    setActionLoading(false);
  }

  async function postComment(authorRole: string) {
    if (!newComment.trim()) return;
    setActionLoading(true);
    await fetch(`/api/proposals/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_role: authorRole, body: newComment }),
    });
    setNewComment('');
    await load();
    setActionLoading(false);
  }

  if (loading) return <main className="max-w-3xl mx-auto p-8">Loading...</main>;
  if (!proposal) return <main className="max-w-3xl mx-auto p-8">Proposal not found.</main>;

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      <button onClick={() => router.push('/')} className="text-blue-600 text-sm">
        ← Back to dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold">{proposal.title}</h1>
        <p className="text-sm text-gray-500">
          Submitted by {proposal.submitter_name} · {proposal.venue}
        </p>
        <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-gray-200">
          {proposal.status.replace('_', ' ')}
        </span>
        {proposal.has_venue_conflict && (
          <span className="inline-block mt-2 ml-2 text-xs px-2 py-1 rounded bg-red-200 text-red-800">
            ⚠ Venue conflict with an approved AP
          </span>
        )}
      </div>

      <div className="border rounded p-4 space-y-2">
        <h2 className="font-semibold">Details</h2>
        <p><span className="font-medium">Objectives:</span> {proposal.objectives}</p>
        <p><span className="font-medium">Description:</span> {proposal.description}</p>
        <p><span className="font-medium">Schedule:</span> {new Date(proposal.schedule_start).toLocaleString()} — {new Date(proposal.schedule_end).toLocaleString()}</p>
        <p><span className="font-medium">Target Audience:</span> {proposal.target_audience}</p>
        <p><span className="font-medium">Materials:</span> {proposal.materials || '—'}</p>
        <p><span className="font-medium">Budget:</span> ₱{proposal.budget_amount.toLocaleString()} ({proposal.funding_source || 'no source given'})</p>
      </div>

      {review && (
        <div className="border rounded p-4 space-y-2 bg-blue-50">
          <h2 className="font-semibold">AI Review</h2>
          {review.completeness_flags.length === 0 && review.consistency_flags.length === 0 ? (
            <p className="text-sm text-green-700">No issues flagged.</p>
          ) : (
            <ul className="text-sm list-disc pl-5 space-y-1">
              {review.completeness_flags.map((f, i) => (
                <li key={`c-${i}`}><span className="font-medium">{f.field}:</span> {f.issue}</li>
              ))}
              {review.consistency_flags.map((f, i) => (
                <li key={`x-${i}`}>{f.issue}</li>
              ))}
            </ul>
          )}
          <p className="text-sm italic mt-2">{review.draft_feedback}</p>
        </div>
      )}
      {actionError && (
        <div className="bg-red-100 text-red-800 p-3 rounded text-sm">{actionError}</div>
      )}

      <div className="flex gap-2">
        <button
          disabled={actionLoading}
          onClick={() => updateStatus('approved')}
          className="bg-green-600 text-white px-3 py-2 rounded disabled:opacity-50"
        >
          Approve
        </button>
        <button
          disabled={actionLoading}
          onClick={() => updateStatus('revision_requested')}
          className="bg-orange-500 text-white px-3 py-2 rounded disabled:opacity-50"
        >
          Request Revision
        </button>
        <button
          disabled={actionLoading}
          onClick={() => updateStatus('rejected')}
          className="bg-red-600 text-white px-3 py-2 rounded disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      <div className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Comments</h2>
        {comments.map((c) => (
          <div key={c.id} className="text-sm border-b pb-2">
            <span className="font-medium">{c.author_role}:</span> {c.body}
          </div>
        ))}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full border rounded p-2 text-sm"
          placeholder="Write a comment..."
        />
        <button
          disabled={actionLoading}
          onClick={() => postComment('signatory')}
          className="bg-blue-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
        >
          Post as Signatory
        </button>
      </div>
    </main>
  );
}
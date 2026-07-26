export type ProposalStatus =
  | 'submitted'
  | 'under_review'
  | 'revision_requested'
  | 'approved'
  | 'rejected';

export interface ActivityProposal {
  id: string;
  title: string;
  objectives: string;
  description: string;
  schedule_start: string; // ISO timestamp
  schedule_end: string;
  target_audience: string;
  venue: string;
  materials: string | null;
  budget_amount: number;
  funding_source: string | null;
  status: ProposalStatus;
  submitter_name: string;
  has_venue_conflict: boolean;
  created_at: string;
  updated_at: string;
}

// Fields required when creating a new proposal (id/status/timestamps are set by the server)
export type NewProposalInput = Omit
  ActivityProposal,
  'id' | 'status' | 'has_venue_conflict' | 'created_at' | 'updated_at'
>;
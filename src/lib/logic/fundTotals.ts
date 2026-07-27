interface ProposalForTotals {
  status: string;
  budget_amount: number;
}

export function calculateFundTotals(proposals: ProposalForTotals[]) {
  const totalRequested = proposals.reduce((sum, p) => sum + Number(p.budget_amount), 0);
  const totalApproved = proposals
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + Number(p.budget_amount), 0);

  return { totalRequested, totalApproved };
}
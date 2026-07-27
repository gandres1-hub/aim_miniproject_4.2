import { describe, it, expect } from 'vitest';
import { calculateFundTotals } from '@/lib/logic/fundTotals';

describe('calculateFundTotals', () => {
  it('sums all proposals for totalRequested regardless of status', () => {
    const proposals = [
      { status: 'submitted', budget_amount: 1000 },
      { status: 'approved', budget_amount: 2000 },
      { status: 'rejected', budget_amount: 500 },
    ];

    const { totalRequested } = calculateFundTotals(proposals);
    expect(totalRequested).toBe(3500);
  });

  it('only sums approved proposals for totalApproved', () => {
    const proposals = [
      { status: 'submitted', budget_amount: 1000 },
      { status: 'approved', budget_amount: 2000 },
      { status: 'approved', budget_amount: 3000 },
    ];

    const { totalApproved } = calculateFundTotals(proposals);
    expect(totalApproved).toBe(5000);
  });

  it('returns zero totals for an empty list', () => {
    const { totalRequested, totalApproved } = calculateFundTotals([]);
    expect(totalRequested).toBe(0);
    expect(totalApproved).toBe(0);
  });
});
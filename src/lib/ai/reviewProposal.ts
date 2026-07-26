import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { NewProposalInput } from '@/lib/types';

export interface AIReviewResult {
  completeness_flags: { field: string; issue: string }[];
  consistency_flags: { issue: string }[];
  draft_feedback: string;
}

const SYSTEM_PROMPT = `You are reviewing a school Activity Proposal (AP) for completeness and internal consistency before a human approver reads it. You do not approve or reject proposals — you only flag issues and draft polite, specific feedback for the submitter.

Flag these kinds of issues:
- Missing or vague fields (e.g. objectives that don't say what the activity is trying to achieve, materials left blank when the activity clearly needs equipment)
- A budget amount listed with no funding source
- Schedule times that don't make sense (start at or after end)
- Objectives that don't match the stated description of the activity

Respond with ONLY valid JSON in this exact shape, no other text:
{
  "completeness_flags": [{ "field": "string", "issue": "string" }],
  "consistency_flags": [{ "issue": "string" }],
  "draft_feedback": "string - a short, polite message to the submitter summarizing what to fix, or a brief note that everything looks good if there are no issues"
}`;

function buildUserPrompt(proposal: Partial<NewProposalInput>): string {
  return `Activity Proposal to review:

Title: ${proposal.title}
Objectives: ${proposal.objectives}
Description: ${proposal.description}
Schedule: ${proposal.schedule_start} to ${proposal.schedule_end}
Target Audience: ${proposal.target_audience}
Venue: ${proposal.venue}
Materials: ${proposal.materials || '(none listed)'}
Budget Amount: ${proposal.budget_amount}
Funding Source: ${proposal.funding_source || '(none listed)'}`;
}

const FALLBACK_RESULT: AIReviewResult = {
  completeness_flags: [],
  consistency_flags: [],
  draft_feedback: 'AI review unavailable — manual review required.',
};

export async function reviewProposal(
  proposal: Partial<NewProposalInput>
): Promise<AIReviewResult> {
  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5'),
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(proposal),
    });

    const parsed = JSON.parse(text);

    if (
      !Array.isArray(parsed.completeness_flags) ||
      !Array.isArray(parsed.consistency_flags) ||
      typeof parsed.draft_feedback !== 'string'
    ) {
      console.error('AI review returned unexpected shape:', parsed);
      return FALLBACK_RESULT;
    }

    return parsed as AIReviewResult;
  } catch (err) {
    console.error('AI review failed:', err);
    return FALLBACK_RESULT;
  }
}
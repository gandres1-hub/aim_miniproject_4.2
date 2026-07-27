import { describe, it, expect } from 'vitest';

// Mirrors the cleaning logic in reviewProposal.ts — kept as a standalone
// function here so it's directly testable without mocking the Anthropic API.
function cleanAIResponse(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

describe('AI review response cleaning', () => {
  it('strips markdown code fences with json label', () => {
    const raw = '```json\n{"a":1}\n```';
    expect(cleanAIResponse(raw)).toBe('{"a":1}');
  });

  it('strips plain code fences without a language label', () => {
    const raw = '```\n{"a":1}\n```';
    expect(cleanAIResponse(raw)).toBe('{"a":1}');
  });

  it('leaves already-raw JSON untouched', () => {
    const raw = '{"a":1}';
    expect(cleanAIResponse(raw)).toBe('{"a":1}');
  });
});
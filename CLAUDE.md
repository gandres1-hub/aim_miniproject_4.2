# CLAUDE.md — AI Coding Assistant Guide

This file orients Claude Code (or any AI coding assistant) working in this repo. Read `PRD.md`, `architecture-notes.md`, and `spec.md` first — this file is about *how to work*, not *what to build*.

## Project Summary

AP Review Dashboard: a Next.js app where school staff submit Activity Proposals, an AI reviewer pre-screens them for completeness/consistency, and signatories/committee track approval status, venue conflicts, and fund totals. Full functional detail is in `spec.md`.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Supabase (Postgres) — no Supabase Auth in MVP
- Vercel AI SDK + Anthropic Claude for the review feature
- Vitest for unit tests
- Deployed on Vercel, CI via GitHub Actions

## Working Conventions

1. **Follow `spec.md` exactly for data models and API contracts.** If a change is needed, update `spec.md` first, then implement — don't let code and spec drift.
2. **Keep AI usage scoped to the reviewer feature only.** Deterministic logic (venue conflicts, fund totals, status transitions) must be plain TypeScript, not LLM calls — see `architecture-notes.md` §7 for the reasoning.
3. **Never hardcode API keys or Supabase keys.** Always read from `process.env.*`. Add any new required env var to `.env.example` (not `.env.local`).
4. **Server-only secrets** (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`) must only be used in server components / route handlers, never in client components.
5. **Validate all API input** server-side per spec §8, and return 400 with a clear message on failure — don't let bad input reach the database or the AI call.
6. **AI review calls must handle failure gracefully** (spec §5) — never let a malformed or failed Claude response 500 the request.
7. **Commit granularity:** aim for small, meaningful commits (schema, then API routes, then UI, then tests, then CI) — at least 5 for the assignment, but really as many as make sense.
8. **Write unit tests alongside the logic they test**, not as an afterthought at the end — at minimum: conflict detection, fund totals, AI response parsing.
9. **Don't add auth, payments, or features listed as out-of-scope** in `PRD.md` §5 unless explicitly asked.

## File/Folder Structure (expected)

```
/app
  /api/proposals/route.ts
  /api/proposals/[id]/route.ts
  /api/proposals/[id]/comments/route.ts
  /api/venues/conflicts/route.ts
  /api/summary/route.ts
  /proposals/new/page.tsx
  /proposals/[id]/page.tsx
  /committee/page.tsx
  page.tsx                # main dashboard
/lib
  ai/reviewProposal.ts
  db/supabaseClient.ts
  logic/venueConflicts.ts
  logic/fundTotals.ts
/tests
  venueConflicts.test.ts
  fundTotals.test.ts
  aiReviewParsing.test.ts
.env.example
```

## When Unsure

If a request conflicts with `spec.md` or introduces scope not in `PRD.md`, flag it rather than silently implementing it — ask, or note the assumption clearly in the commit message/PR description.

# Architecture Notes — AP Review Dashboard

## 1. High-Level Overview

A single Next.js 14 app (App Router) serves both the UI and the API routes. No separate backend service. Supabase provides Postgres storage. The Anthropic API (via Vercel AI SDK) powers the one core AI feature: the Proposal Reviewer.

```
┌─────────────────────────────┐
│         Browser (UI)        │
│  Submitter / Signatory /    │
│  Committee views (role      │
│  switcher — no real auth)   │
└──────────────┬───────────────┘
               │ fetch
┌──────────────▼───────────────┐
│  Next.js API Routes           │
│  /api/proposals                │
│  /api/proposals/[id]/review    │  → calls Anthropic API
│  /api/proposals/[id]/comments  │
│  /api/venues/conflicts         │
│  /api/summary                  │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│  Supabase (Postgres)          │
│  activity_proposals            │
│  ai_reviews                    │
│  comments                      │
│  venues                        │
└───────────────────────────────┘
```

## 2. Components

### Frontend (Next.js + Tailwind)
- `/` — dashboard: list of APs, filterable by status, role-aware view
- `/proposals/new` — submission form
- `/proposals/[id]` — AP detail: full fields, AI review output, comment thread, status controls
- `/committee` — committee-only summary view (fund totals, pending count, conflicts)
- Role switcher lives in the top nav (client-side state, not persisted server-side)

### API Layer (Next.js Route Handlers)
- `POST /api/proposals` — create AP, triggers venue conflict check + AI review synchronously
- `GET /api/proposals` / `GET /api/proposals/[id]` — read
- `PATCH /api/proposals/[id]` — update status (approve/reject/request revision)
- `POST /api/proposals/[id]/comments` — add a comment (human or AI-drafted, editable before send)
- `GET /api/summary` — aggregated fund totals + pending/conflict counts for Committee view

### AI Layer (Vercel AI SDK + Claude)
- Single server-side function `reviewProposal(ap)`:
  - Sends structured AP fields to Claude with a system prompt describing what "complete" and "consistent" mean for this org
  - Requests **structured JSON output**: `{ completeness_flags: [...], consistency_flags: [...], draft_feedback: string }`
  - Result stored in `ai_reviews` table, linked to the AP
- Conflict check is **not** AI — it's a plain SQL date-range overlap query against `venues` + `activity_proposals`. Kept separate from the AI layer intentionally (right tool for the job).

### Database (Supabase / Postgres)
See `spec.md` for full schema. No Supabase Auth used in MVP — role switcher is UI-only state.

## 3. Data Flow: Submission → Review

1. Submitter fills form → `POST /api/proposals`
2. Server inserts row (`status = submitted`)
3. Server runs venue conflict query → if conflict, flag stored on the AP
4. Server calls `reviewProposal()` → Claude returns structured flags + draft feedback
5. Result saved to `ai_reviews`, AP status set to `under_review`
6. Signatory view shows AI flags + draft feedback; signatory can edit and post as a comment, or approve directly
7. If revision requested, submitter edits and resubmits (status returns to `submitted`)

## 4. Environment Variables (no secrets in repo)

- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never exposed to client)

All read from `.env.local` (gitignored) locally, and from GitHub Actions / Vercel project secrets in CI/CD.

## 5. Deployment

- **Host:** Vercel (auto-deploys `main` branch)
- **CI:** GitHub Actions workflow runs lint + unit tests on every push/PR; deployment itself is handled by Vercel's GitHub integration (Actions gates merges, doesn't need to duplicate the deploy step)
- **Monitoring:** Vercel Analytics (basic pageview/traffic) as the "basic monitoring" requirement

## 6. Testing Approach

- Unit tests (Vitest or Jest) for:
  1. Venue conflict detection logic (overlap math)
  2. Fund total aggregation logic
  3. AI review response parsing/validation (mocked Claude response → correctly parsed into flags)

## 7. Key Constraints Reflected in This Architecture

- No hardcoded secrets — all via env vars
- AI does judgment/language work only (review, feedback drafting); deterministic logic (conflicts, totals) stays in plain code — cheaper, faster, more testable, and avoids over-relying on AI for things it's not needed for

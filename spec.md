# spec.md — AP Review Dashboard

## 1. Purpose

Functional specification for building the AP Review Dashboard MVP described in `PRD.md` and `architecture-notes.md`. This is the source of truth for AI-assisted coding sessions.

## 2. Data Models

### `activity_proposals`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| title | text | required |
| objectives | text | required |
| description | text | required |
| schedule_start | timestamptz | required |
| schedule_end | timestamptz | required |
| target_audience | text | required |
| venue | text | required; matched against `venues.name` |
| materials | text | optional |
| budget_amount | numeric | required, >= 0 |
| funding_source | text | required if budget_amount > 0 |
| status | enum | `submitted`, `under_review`, `revision_requested`, `approved`, `rejected` |
| submitter_name | text | required (free text, no auth) |
| has_venue_conflict | boolean | default false, set by conflict check |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | |

### `ai_reviews`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| proposal_id | uuid, FK → activity_proposals | |
| completeness_flags | jsonb | array of `{ field, issue }` |
| consistency_flags | jsonb | array of `{ issue }` |
| draft_feedback | text | AI-generated, editable before sending |
| created_at | timestamptz | |

### `comments`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| proposal_id | uuid, FK | |
| author_role | enum | `submitter`, `signatory`, `committee`, `ai` |
| body | text | |
| created_at | timestamptz | |

### `venues`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text, unique | seed with a fixed list (e.g., Gym, Auditorium, Room 101, Field) |

## 3. API Contract

### `POST /api/proposals`
- Body: all `activity_proposals` fields except `id`, `status`, `has_venue_conflict`, timestamps
- Validates required fields server-side (return 400 with field-level errors if missing)
- On success: inserts row with `status = submitted`, runs conflict check, runs AI review, returns the created AP + review

### `GET /api/proposals?status=&venue=`
- Returns list, optionally filtered

### `GET /api/proposals/[id]`
- Returns AP + latest `ai_reviews` row + all comments (ordered by created_at)

### `PATCH /api/proposals/[id]`
- Body: `{ status }` — must be a valid transition (see state machine below)

### `POST /api/proposals/[id]/comments`
- Body: `{ author_role, body }`

### `GET /api/venues/conflicts?venue=&start=&end=&excludeId=`
- Returns any `activity_proposals` rows at the same venue with overlapping `[schedule_start, schedule_end]`, excluding the proposal being checked

### `GET /api/summary`
- Returns `{ pending_count, approved_count, revision_requested_count, total_requested, total_approved, total_disbursed, conflict_count }`

## 4. State Machine

```
submitted ──► under_review ──► approved
                 │                
                 ├──► revision_requested ──► submitted (resubmit)
                 │
                 └──► rejected
```

- `submitted → under_review`: automatic, immediately after AI review completes
- `under_review → approved / rejected / revision_requested`: signatory action (via `PATCH`)
- `revision_requested → submitted`: submitter edits and resubmits (creates a new review cycle, does not create a new row — updates the same AP)

## 5. AI Review Behavior (core feature)

**Input to Claude:** all AP fields, plus a list of currently approved APs at the same venue (for context, not for the AI to compute the conflict itself — conflict detection is deterministic, see §6).

**System prompt intent:**
> You are reviewing a school Activity Proposal for completeness and internal consistency before a human approver reads it. Do not approve or reject — only flag issues and draft polite, specific feedback. Flag: missing/vague fields, budget amounts without a funding source, schedules with start >= end, objectives that don't match the stated activity description. Return structured JSON only.

**Expected output shape:**
```json
{
  "completeness_flags": [{ "field": "funding_source", "issue": "Budget listed but no funding source given" }],
  "consistency_flags": [{ "issue": "Schedule end time is before start time" }],
  "draft_feedback": "Hi [submitter], thanks for submitting..."
}
```

**Validation:** API route must validate the JSON shape before storing; on malformed output, retry once, then fall back to `{ flags: [], draft_feedback: "AI review unavailable — manual review required" }` so the app never breaks on a bad AI response.

## 6. Venue Conflict Logic (deterministic, not AI)

Two APs conflict if: same `venue` (case-insensitive match) AND date ranges overlap:
```
NOT (a.schedule_end <= b.schedule_start OR a.schedule_start >= b.schedule_end)
```
Only check against APs with `status = approved` (pending ones shouldn't block a new submission, just get flagged for awareness).

## 7. Fund Totals Logic (deterministic)

- `total_requested` = sum of `budget_amount` for all APs regardless of status
- `total_approved` = sum of `budget_amount` where `status = approved`
- `total_disbursed` = same as approved for MVP (no separate disbursement tracking — noted as a v2 improvement)

## 8. Validation Rules (input)

- All required fields non-empty
- `schedule_start < schedule_end`
- `budget_amount >= 0`
- If `budget_amount > 0`, `funding_source` required
- `venue` must match an entry in `venues` table

## 9. Non-Functional Requirements

- No secrets in client-side code or repo
- API routes reject requests with missing required fields (400, not 500)
- AI call failures must degrade gracefully (see §5 fallback)

## 10. Explicitly Out of Scope (see PRD §5)
Real auth, real payments, parallel multi-level approval routing, recurring bookings.

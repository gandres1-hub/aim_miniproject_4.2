# Product Requirements Document (PRD)
## AP Review — AI-Assisted Activity Proposal Dashboard

**Version:** 0.1 (Draft)
**Author:** [Your name(s)]
**Date:** July 26, 2026

---

### 1. Problem

Students and teachers must submit an Activity Proposal (AP) for any activity outside the regular classroom setting. Today this process is manual: proposals move between submitters, signatories, and the Management Committee via email or paper, with no shared view of status, no automated check for venue conflicts, and no running total of committed vs. disbursed funds. This causes delays, duplicate venue bookings, and unclear proposal status for submitters.

### 2. Target Users

| User | Need |
|---|---|
| **Submitter** (student/teacher) | Submit an AP quickly, know its status, get clear feedback if revisions are needed |
| **Signatory** (approver) | Review APs efficiently, spot issues without re-reading every section manually |
| **Management Committee** | See overall pipeline: pending approvals, venue conflicts, fund exposure |

### 3. Goal

Give submitters, signatories, and the Committee a shared dashboard for AP status, with an AI reviewer that pre-screens every submission for completeness and conflicts before a human signatory looks at it — reducing back-and-forth cycles and catching venue/budget issues earlier.

### 4. Core Features (MVP)

1. **AP Submission Form** — objectives/description, schedule, target audience, venue, materials/equipment, budget (source + amount).
2. **AI Proposal Reviewer** *(core AI capability)* — on submission, an LLM checks the AP for:
   - Missing or vague fields (e.g., no funding source, no end time)
   - Internal inconsistencies (e.g., budget listed but no source of funds)
   - Drafts specific, editable feedback comments for the signatory to send back
3. **Venue Conflict Check** — flags date/time overlaps with already-approved APs at the same venue.
4. **Approval Workflow** — status states: `submitted → under_review → revision_requested → approved / rejected`, with a comment thread per AP.
5. **Fund Tracker** — running totals of requested, approved, and disbursed amounts across all APs.
6. **Role Switcher** — a simple view toggle (Submitter / Signatory / Committee) to demo all three perspectives without building full authentication.

### 5. Out of Scope (v1)

- Real user authentication/login
- Real payment processing or disbursement integration
- Multi-level parallel approval routing
- Recurring/repeating venue bookings

### 6. Success Criteria

- A submitter can create an AP and see its status change as it moves through review.
- The AI reviewer produces useful, specific feedback (not generic) on at least 3 distinct test proposals with intentionally different flaws.
- Two APs booking the same venue on overlapping dates are flagged automatically.
- The Committee view shows an accurate running total of requested/approved/disbursed funds.

### 7. Differentiating Angle

Unlike a generic approval-tracking tool, the AI reviewer acts as a **first-pass quality gate** — catching incomplete or inconsistent proposals *before* a human signatory spends time on them, and giving submitters actionable feedback immediately instead of waiting for a manual review cycle.

### 8. Risks / Open Questions

- How strict should the AI reviewer be before it risks being annoying/over-flagging minor issues?
- What counts as a "conflict" for venues (exact overlap vs. buffer time between events)?

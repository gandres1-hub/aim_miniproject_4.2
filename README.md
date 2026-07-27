# AP Review Dashboard

An AI-assisted dashboard for processing school Activity Proposals (APs) — built for the Week 4 Graded Assignment 4.2 (AI-Powered Web Application) mini-project.

Students and teachers submit an AP for any activity outside the regular classroom setting. This app lets submitters track their proposal's status, gives signatories an AI-generated first-pass review before they read a proposal in full, catches venue double-bookings automatically, and gives the Management Committee a running view of requested vs. approved funds.

## Live Demo

- **Live URL:** https://aim-miniproject-4-2-five.vercel.app
- **Demo recording:** [add your 2-minute demo link here once recorded]
- **Repo:** https://github.com/gandres1-hub/aim_miniproject_4.2

## Core Features

- **AP submission form** — objectives, description, schedule, target audience, venue, materials, budget, and funding source
- **AI Proposal Reviewer** (core AI feature) — every submission is automatically reviewed by Claude for completeness and internal consistency (vague objectives, missing funding source, schedule inconsistencies, etc.), producing specific, editable feedback for the signatory — before a human ever reads it
- **Venue conflict detection** — checks new submissions against already-approved proposals for date/venue overlaps, and **blocks approval outright** if approving would create a conflict with another approved proposal (naming which proposal it conflicts with)
- **Approval workflow** — status moves through `submitted → under_review → approved / rejected / revision_requested`, with a comment thread on each proposal
- **Fund tracking** — running totals of requested vs. approved budget amounts, shown on the dashboard
- **Role switcher (password-gated)** — anyone can browse proposals, view AI reviews, and check for venue conflicts; only someone who enters the Signatory password can approve, reject, or request revisions

## Tech Stack

- **Frontend & API:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database:** Supabase (Postgres)
- **AI:** Anthropic Claude via the Vercel AI SDK
- **Deployment:** Vercel
- **CI:** GitHub Actions

## Architecture

See [`architecture-notes.md`](./architecture-notes.md) for the full system diagram and data flow. In short: the browser never talks to Supabase directly — all reads/writes go through Next.js API routes, which use a server-only Supabase key. The AI is scoped specifically to the proposal review feature; venue conflict detection and fund totals are deterministic logic, not AI calls.

## Data Model

See [`spec.md`](./spec.md) for the full schema, API contract, and validation rules.

## Getting Started Locally

1. Clone the repo and install dependencies:
   ```
   npm install
   ```

2. Create a `.env.local` file in the project root with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   NEXT_PUBLIC_SIGNATORY_PASSWORD=your_chosen_signatory_password
   ```
   None of these are committed — `.env.local` is covered by `.gitignore`.

3. Set up the database: run the SQL in [`spec.md`](./spec.md) (§2 Data Models) against a Supabase project's SQL Editor to create the required tables, or ask for the seed script.

4. Run the dev server:
   ```
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Testing

Unit tests cover venue conflict detection, fund total calculations, and AI review response parsing:
```
npm test
```

## Known Limitations (v1)

- **No real authentication.** The role switcher is a client-side, password-gated toggle — it improves the demo experience and reflects the intended workflow, but it is not a real security boundary (a determined user could still call the API directly). Production use would need real auth (e.g. Supabase Auth or Clerk) with server-enforced roles.
- **No real fund disbursement tracking** — "approved" and "disbursed" amounts are currently treated the same; a real system would track actual disbursement separately.
- **Single venue list is hardcoded** — venues are seeded manually rather than manageable through the UI.
- **No parallel/multi-level approval routing** — one approval step, not a chain of signatories.

See the [GitHub Issues](../../issues) for planned v2 improvements.

## Project Documentation

- [`PRD.md`](./PRD.md) — product requirements
- [`architecture-notes.md`](./architecture-notes.md) — system architecture
- [`spec.md`](./spec.md) — detailed functional spec, data model, and API contract
- [`CLAUDE.md`](./CLAUDE.md) / [`.cursorrules`](./.cursorrules) — conventions for AI-assisted coding on this project

## Reflection

See [`reflection.md`](./reflection.md) for a 1-page reflection on the build process.

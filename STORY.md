# The Story

This project is a portfolio piece, but the product isn't the whole point — **how it was steered** is. It was built by directing an AI coding agent through ~29 releases, each with its own review document. The valuable decisions were human: knowing what to build, what *not* to build, when to stop and fix the foundation, and how to be honest about what actually works.

If you only read one thing, read this.

## Where it started

A "vibe-coded" MVP: a single Kanban board, no persistence, no auth — the kind of thing an AI generates in minutes. Fast, but fragile. On top of it, ~20 releases piled on SaaS ambition: auth, projects, an AI studio, teams, multi-assignee. Velocity was high. So was the hidden debt.

## The turning point: audit, then *stop*

Instead of shipping the next feature, I ran an **architectural audit** — and treated my own findings as claims to verify, not truths. Several were real:

- "Persistence" that only wrote to `localStorage`, so a whole feature silently lost data in production mode.
- A SQL schema with a syntax-broken policy that wouldn't even run, and three schemas that disagreed with each other and with the code.
- A service that silently fell back to `localStorage` on failure, quietly splitting data between the database and the browser.
- Three unconnected identities (account, team member, assignee) with no relation between them.

The important move wasn't finding the debt — it was the decision to **stop feature work** and spend a full release paying it down (**R21 — Data Foundation**): one true schema, a repository-style dual-mode persistence, transparent error reporting instead of silent fallbacks. Boring. Unglamorous. Exactly the reflex a senior wants to see.

## The arc

| Phase | Release | The judgment call |
|---|---|---|
| **Stabilize** | R21 Data Foundation | Stop shipping features; fix persistence, schema, split-brain — with tests before more is built on top. |
| **Fix right** | Drag & Drop bugfix | Dragging one card swapped whole columns. Found the *root cause* (event bubbling made a card-drag also a column-drag), not a workaround — and wrote a regression test proven to fail without the fix. |
| **Build real** | R22 Workspace Collaboration | Separate two membership levels (workspace vs project) cleanly, reusing the stabilized layer. |
| **Normalize** | R23 Real Accounts | Unify the three identities; migrate a JSONB prototype into a relational model with FKs, cascades, RLS, and a backfill migration. |
| **Design system** | R24 Visual System Redesign | A real theme system (Light/Dark/System) on centralized design tokens — no hardcoded colors, one-file palette changes. |
| **Finish** | R25 Quality & Finish | Remove dead code, gate stray logging, add accessible focus, code-split heavy modals, dedupe logic — the unglamorous 1.0 polish. |
| **UX** | Kanban Scroll Rework | Move scrolling from inside columns to the document level; the fix hinged on one subtle CSS truth, found by measuring the DOM, not guessing. |
| **Extend** | Calendar view | A second per-project view (cards by due date) that reuses the existing task drawer with *zero* duplicated logic. |

## What it demonstrates

- **Judgment over output.** The rarest thing here isn't code — it's the decision to *stop adding features and pay down debt*, and to fix bugs at the root.
- **A QA/testing mindset in motion.** Audit → fix → regression test → verify in the browser → state the limits. Every release ends green (lint, build, 92 tests) and is checked by actually driving the app.
- **Directing an AI agent well.** Release scoping, "find the cause, not a workaround," "don't add new features," honest reviews — this is context/prompt engineering applied to a real, evolving codebase, not a toy.
- **Honesty as a feature.** Where something couldn't be done (a stock photo I approximated, Supabase paths verified statically rather than against a live DB), it's said plainly — in the reviews and here.

## Who built it

Directed by **Michael Beneš** — 8+ years across IT support, QA/testing, and project management — as the engineering lead over an AI coding agent. The role was architecture, audit, product decisions, and quality: the parts that don't come for free with "the AI wrote it."

The per-release reviews (`21`–`29_*_review.md`) are the receipts.

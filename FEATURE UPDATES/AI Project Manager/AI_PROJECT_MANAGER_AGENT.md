# AI_PROJECT_MANAGER_AGENT.md

# AI Project Manager – Product Specification

## Vision

Transform Project Intelligence into an active AI Project Manager.

The AI should not only analyze the project, but also prepare intelligent changes for the board.

The AI NEVER changes the project automatically.

It always proposes changes first and waits for user approval.

---

# Goal

Turn project management from a manual workflow into an AI-assisted workflow.

The user should be able to optimize an entire project with one click.

---

# MVP

## Analyze Project

AI analyzes:

- task status
- blocked tasks
- overdue tasks
- priorities
- workload
- dependencies
- project health

Generate a short summary and recommendations.

---

## Suggested Board Changes

AI may suggest:

- move tasks between columns
- change priorities
- split large tasks
- merge duplicate tasks
- archive completed work
- identify blocked work
- recommend next tasks

Nothing is applied automatically.

---

## Review Mode

Display proposed changes like a Git diff.

Example:

- Move Authentication → In Progress
- Split Billing into 4 tasks
- Merge Login + Register
- Archive completed sprint

Actions:

- Apply All
- Apply Individually
- Reject

---

## Project Health

Extend current Health Score with:

- overall health
- risks
- blockers
- overdue work
- completion forecast
- confidence score

---

## Smart Recommendations

Examples:

- Finish Authentication before Dashboard
- Reduce Work In Progress
- Assign reviewer
- Move low priority tasks to Backlog

---

## Future Roadmap

### v2

- Sprint Planning
- Capacity Planning
- Release Preparation
- Daily Brief

### v3

- AI Product Owner
- AI Scrum Master
- Automatic roadmap suggestions
- Team workload optimization

---

# UI

Reuse the existing Project Intelligence panel.

Do not redesign the application.

Extend the existing interface gradually.

---

# Architecture

- Reusable services
- Modular AI prompts
- Strict TypeScript
- No duplicated logic
- Keep AI decision layer separated from UI

---

# Safety Rules

AI must never:

- delete data automatically
- move tasks without confirmation
- change priorities silently

Every change requires explicit user approval.

---

# Deliverables

For every implementation phase provide:

- summary
- changed files
- architecture decisions
- risks
- next recommended phase

Implement in small phases.

# TEAM_COLLABORATION_AGENT.md

# Role

You are the **Senior Full-Stack Engineer and Tech Lead** for the
ClearSpace project.

Your goal is **not only to make the feature work**, but to implement it
as production-quality software that is scalable, maintainable and
consistent with the existing architecture.

------------------------------------------------------------------------

# Objective

Implement **Team Collaboration MVP (v1.2)**.

The current application is single-user. Transform it into a
collaborative application where multiple users can work on the same
project in real time.

Target: - max 10 users per project - no organizations/workspaces yet -
no team chat - production-ready architecture

------------------------------------------------------------------------

# Tech Stack

-   Next.js
-   React
-   TypeScript
-   Supabase
-   PostgreSQL
-   Supabase Auth
-   Supabase Realtime
-   Tailwind

Reuse existing architecture whenever possible.

------------------------------------------------------------------------

# Scope

## 1. Invitations

Implement:

-   Invite user by email
-   Email invitation
-   Accept invitation
-   Reject invitation
-   Pending invitations
-   Expired invitations

Use secure invitation tokens.

------------------------------------------------------------------------

## 2. Project Members

Create project members system.

Roles:

-   Owner
-   Editor

Owner can:

-   invite members
-   remove members
-   transfer ownership (prepare architecture)

Editor can:

-   work on project
-   cannot manage members

Maximum: 10 members.

------------------------------------------------------------------------

## 3. Authentication & Permissions

Every project must belong to authenticated users.

Implement proper authorization.

Users must never access projects they are not members of.

Use Supabase Row Level Security.

------------------------------------------------------------------------

## 4. Realtime Collaboration

Synchronize in real time:

-   create task
-   edit task
-   delete task
-   move task
-   rename columns
-   create columns
-   delete columns

Use Supabase Realtime.

Avoid unnecessary rerenders.

------------------------------------------------------------------------

## 5. Presence

Display:

-   online users
-   currently active users
-   optional "editing..." indicators

Use Supabase Presence.

------------------------------------------------------------------------

## 6. Activity Feed

Instead of chat implement activity feed.

Log events such as:

-   project created
-   member invited
-   member joined
-   task created
-   task edited
-   task completed
-   task moved
-   task deleted
-   column renamed

Requirements:

-   newest first
-   timestamps
-   actor
-   entity
-   action type

Prepare architecture for future filtering.

------------------------------------------------------------------------

# Database

Expected new tables:

-   project_members
-   invitations
-   activity_logs

Modify existing tables only if necessary.

------------------------------------------------------------------------

# UI

Keep existing design language.

Add:

Project Settings

Members

Invite dialog

Activity panel

Do not redesign unrelated UI.

------------------------------------------------------------------------

# Architecture Rules

-   Small reusable components
-   Reusable hooks
-   Strict TypeScript
-   Clean folder structure
-   No duplicated logic
-   No unnecessary abstractions
-   Production quality only

------------------------------------------------------------------------

# Performance

Optimize for:

-   low database reads
-   minimal realtime traffic
-   optimistic UI where appropriate

------------------------------------------------------------------------

# Future Compatibility

Prepare architecture for future:

-   Workspaces
-   Organizations
-   Comments
-   Attachments
-   AI summaries

Do NOT implement these features.

------------------------------------------------------------------------

# Workflow

Implement feature in small logical phases.

After each phase:

1.  Verify build
2.  Verify TypeScript
3.  Verify lint
4.  Test functionality
5.  Commit-ready code

Never implement everything in one giant refactor.

------------------------------------------------------------------------

# Deliverables

For every phase provide:

-   summary
-   changed files
-   architecture decisions
-   possible risks
-   next recommended phase

If unsure, prefer maintainability over speed.

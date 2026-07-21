# RESPONSIVE_IMPLEMENTATION_AGENT.md

# ClearSpace -- Responsive Implementation Agent

## Mission

Your goal is to transform the existing **desktop-first** ClearSpace
application into a polished, production-quality experience for **tablet
and mobile** while preserving the current desktop UI.

The current desktop version is considered **FINAL**.

You are adapting the interface, **not redesigning it**.

------------------------------------------------------------------------

# Core Principles

-   Desktop is the visual reference.
-   Mobile is not a scaled-down desktop.
-   Preserve the ClearSpace identity.
-   Use proven UX patterns from industry-leading productivity apps.
-   Prefer adaptation over reinvention.

------------------------------------------------------------------------

# Before Writing Any Code

## Phase 1 -- Responsive Audit (Required)

Do **NOT** start implementing immediately.

First:

1.  Analyze the entire application.
2.  List every major component.
3.  Evaluate each component for:
    -   Desktop
    -   Tablet
    -   Mobile
4.  Decide whether it requires changes.
5.  Produce an implementation plan.
6.  Wait for review before coding.

Example:

  Component   Desktop   Tablet   Mobile              Action
  ----------- --------- -------- ------------------- ----------------
  Navbar      ✅        ⚠️       ❌                  Hamburger Menu
  Hero        ✅        ✅       Compress            
  Toolbar     ✅        ⚠️       Stack               
  Stats       ✅        Grid     Grid                
  Kanban      ✅        ✅       Horizontal Scroll   
  Dialogs     ✅        ⚠️       Full Screen         

------------------------------------------------------------------------

# UX Inspiration

Before implementation, study how mature productivity applications solve
responsive UX.

Focus on:

-   Navigation
-   Information hierarchy
-   Typography
-   Touch usability
-   Layout adaptation
-   Dialogs
-   Forms
-   Kanban interactions

Recommended inspiration:

-   Trello
-   Linear
-   Notion
-   Asana
-   ClickUp
-   Jira
-   GitHub Mobile
-   Slack
-   Apple Reminders

Do **NOT** copy visual design.

Reuse only proven UX patterns.

When multiple solutions are possible, choose the interaction pattern
already validated by industry-leading applications.

------------------------------------------------------------------------

# Navigation

Desktop navigation remains unchanged.

Mobile navigation should become:

-   Logo
-   Hamburger menu

The menu should contain all important actions already available in the
application.

Suggested structure:

-   Board
-   Projekty
-   AI Studio
-   AI History
-   Týden

------------------------------------------------------------------------

-   Project Intelligence
-   Nový úkol

------------------------------------------------------------------------

-   Board / Kalendář

------------------------------------------------------------------------

-   Light / Dark
-   Profil

Do not add Settings, Billing or other features that do not yet exist.

------------------------------------------------------------------------

# Hero Section

Keep the hero.

Adapt it for mobile:

-   smaller height
-   reduced typography
-   optimized background image
-   info cards stacked vertically

Preserve the premium feeling.

------------------------------------------------------------------------

# Toolbar

Desktop: - Search - Filter - Sort - Members

Mobile: - Search - Filter - Sort

Reduce visual complexity while keeping functionality.

------------------------------------------------------------------------

# Stats Cards

Adapt into responsive grid.

Avoid horizontal scrolling.

------------------------------------------------------------------------

# Kanban

Do NOT redesign the Kanban.

Keep horizontal column scrolling similar to Trello or Linear.

Never convert the board into a list.

------------------------------------------------------------------------

# Typography

Typography must be optimized for smaller screens.

Prefer reducing font sizes rather than increasing them.

Guidelines:

-   Hero heading: max \~32px
-   Body: 14--16px
-   Buttons: 14--15px

------------------------------------------------------------------------

# Spacing

Reduce spacing proportionally.

Example:

Desktop: 32px padding

Mobile: 16px padding

Reduce gaps accordingly.

------------------------------------------------------------------------

# Touch Targets

All interactive elements should have comfortable touch sizes.

Target minimum:

44x44px

------------------------------------------------------------------------

# Dialogs

Evaluate all dialogs.

If appropriate on mobile:

-   Full-screen dialogs or
-   Bottom sheets

Choose whichever provides the better UX.

------------------------------------------------------------------------

# Performance

Maintain excellent performance.

Requirements:

-   No duplicated layouts
-   Reuse existing components
-   Avoid unnecessary rerenders
-   Lazy-load heavy dialogs when appropriate
-   Keep bundle growth minimal

------------------------------------------------------------------------

# Accessibility

Check:

-   touch targets
-   focus states
-   readability
-   spacing
-   contrast
-   horizontal scrolling

------------------------------------------------------------------------

# Things You Must NOT Do

-   Do NOT redesign the application.
-   Do NOT move features to different pages.
-   Do NOT rename navigation.
-   Do NOT remove existing functionality.
-   Do NOT introduce Bottom Navigation.
-   Do NOT replace Kanban with lists.
-   Do NOT create separate mobile pages.
-   Do NOT duplicate components.

------------------------------------------------------------------------

# Development Workflow

1.  Responsive Audit
2.  Wait for review
3.  Tablet implementation
4.  Mobile implementation
5.  Accessibility review
6.  Performance review
7.  Final responsive polish
8.  Final review report

Implement one logical area at a time.

------------------------------------------------------------------------

# Definition of Done

The application should feel as if it was designed for mobile from day
one.

Desktop should remain visually almost identical.

The result should look and behave like a premium SaaS application.

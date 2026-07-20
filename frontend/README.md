# clearspace — frontend (Next.js app)

The application lives here. For the full project overview, architecture, and story, see the repository root:

- [`../README.md`](../README.md) — overview, features, deployment
- [`../ARCHITECTURE.md`](../ARCHITECTURE.md) — technical deep dive
- [`../STORY.md`](../STORY.md) — how it was built

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000  (runs in demo mode with no env vars)
```

## Scripts

```bash
npm run build      # production build (+ type-check)
npm run start      # serve the production build
npm run lint       # eslint
npm run test       # vitest
```

## Environment (optional)

Copy `.env.example` → `.env.local`. With no vars, the app runs in **demo mode**
(mock auth + `localStorage`). Add `NEXT_PUBLIC_SUPABASE_*` to use Supabase, and
`GEMINI_API_KEY` to enable the AI Studio. Supabase schema: [`supabase_schema.sql`](supabase_schema.sql).

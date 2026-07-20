# Navázání: Reálná spolupráce — kde jsme skončili

Rychlý „resume" dokument, aby se dalo kdykoli rovnou navázat. Plný plán je v [31_collaboration_plan.md](31_collaboration_plan.md).

## Stav rozhodnutí (k 2026-07-20)

- ✅ **Plán schválen** jako směr (invites → multi-user → realtime, multi-tenant SaaS).
- ⏸️ **Supabase projekt zatím NEzaložen** — uživatel se rozmýšlí. Bez živého backendu se reálná spolupráce fyzicky nerozjede, takže se zatím nekóduje.
- ▶️ **Start až přijde čas = Fáze 0 (Go live na Supabase).** Potvrzeno uživatelem.
- App zůstává v **demo režimu** (localStorage + mock auth), dokud nepřijdou env klíče.

## Co potřebuju od uživatele, aby Fáze 0 mohla začít (~15 min, free tier)

1. **Založit projekt** na supabase.com → New project (region Frankfurt kvůli latenci). Zapamatovat DB heslo.
2. **Spustit schéma** — obsah `frontend/supabase_schema.sql` (idempotentní) vložit do Supabase SQL Editoru a spustit.
3. **Zkopírovat klíče** z Project Settings → API:
   - `Project URL`
   - `anon public` key
   - `service_role` key — ⚠️ tajný, jen server; potřeba až ve **Fázi 2** (pozvánky), ne pro Fázi 0.
4. **Předat mi URL + anon key** → vytvořím `frontend/.env.local` (je v `.gitignore`) a přepnu appku do Supabase režimu.

## Náplň Fáze 0 (moje práce, až přijdou klíče)

Přepnout na živou DB → projít **všechny** stávající featury proti reálnému backendu (auth, projekty, sloupce, karty, drag&drop, přiřazení, Tým stránka) → opravit „live" bugy, které se v demo režimu nikdy neprojevily → napsat REVIEW `33_go_live_review.md`.

## Pak následuje

Fáze 1 (sdílené workspace + RLS) → 2 (pozvánky) → 3 (realtime) → 4 (permissions). Detail v 31_collaboration_plan.md.

## Bezpečnostní připomínky

- `service_role` klíč nikdy do frontend kódu ani do commitu.
- `.env.local` už kryto `.gitignore`.
- Git remote stále míří na instruktorův repo (ed-donner/kanban) — před pushem si uživatel musí založit vlastní repo. Necommitovat/nepushovat bez pokynu.

# Review Release 23 - Real Accounts + Relational Model

R23 uzavírá datový oblouk R21 (základy) → R22 (workspace vrstva) → R23 (skutečná identita a relační model). Postaveno **demo-first**: běhové demo dál běží na localStorage, relační Supabase vrstva je implementovaná a ověřená typy/buildem/testy (stejná disciplína jako R21/R22). Žádná nová produktová funkce nad rámec cíle.

---

## Architecture Check (výsledek)

Stav po R22 byl dobrý základ: identita (`TeamMember`) i dual-path persistence jsou čisté, workspace vrstva oddělená od projektu. Jediná mezera z původního auditu, která zbývala: **Profile (účet) a TeamMember (člen) byly stále nespojené identity.** R23 je spojuje. Relační normalizaci JSONB polí (member_ids, assignees) do join tabulek jsem udělal jako artefakt + Supabase cestu, protože demo poběží na localStorage (dle dohody).

## A. Sjednocení identity (hlavní, demoable)

- Přihlášený účet (profil) je nově **členem svého workspace s rolí `owner`**, propojený přes `profileId` (člen ↔ profil).
- Id owner člena je deterministické (`member-owner-<profileId>`), takže se přidává idempotentně (žádné duplikáty při reloadu).
- Řeší poslední otevřený bod původního auditu ("tři nespojené identity"): Profile ↔ TeamMember teď má vazbu; `Assignee` už R22 nahradil relací na členy.
- Demoable i bez živé DB: v demo režimu se owner člen odvodí z profilu a doplní do workspace na startu.

## B. Relační datový model (schéma + migrace)

- `workspace_members.profile_id` → vazba člena na reálný účet (`NULL` = placeholder kontakt, připraveno pro Invite Members).
- Nové join tabulky (nahrazují JSONB pole):
  - `project_members (project_id, member_id, project_role)` -- členství projektu.
  - `card_assignees (card_id, member_id, position)` -- přiřazení řešitelů.
  - Obě s FK + `ON DELETE CASCADE` + RLS přes vlastnictví projektu.
- Trigger `handle_new_user` rozšířen: při registraci se vedle profilu automaticky založí i owner člen workspace (idempotentně, `ON CONFLICT DO NOTHING`).
- **Idempotentní backfill migrace** (`DO $$ ... $$`): z `projects.member_ids` → `project_members` a z `cards.assignees` (JSONB) → `card_assignees`. Bezpečné opakované spuštění.

## C. Relační Supabase cesta (služby)

- **Čtení preferuje relace, fallback na JSONB:**
  - `fetchProjectById` čte `project_members`, fallback na `member_ids` (nový projekt / před migrací).
  - `fetchBoardData` čte `card_assignees(position, member:workspace_members(*))`, fallback na JSONB `assignees` a nakonec legacy jednořešitele.
- **Zápisy jdou do relací (kanonicky) + denormalizovaný mirror:**
  - `setProjectMembers` dělá diff `project_members` (přidat/odebrat) + udržuje `member_ids` mirror.
  - `createCard` / `updateCard` / `restoreProjectSnapshot` synchronizují `card_assignees` (`syncDbCardAssignees`).
- Denormalizovaný JSONB mirror je vědomé rozhodnutí (rychlé čtení + migrační zdroj + zpětná kompatibilita AI, které čte `assignee_name`), relační tabulky jsou normalizovaná pravda a základ pro R24 Realtime a budoucí Permissions.

## D. Datový model (typy)

- `TeamMember.profileId?: string` -- vazba na účet.
- Owner člen: `workspaceRole: 'owner'`.
- Beze změny veřejného API služeb pro spotřebitele (komponenty, AI) -- vše ostatní zůstává.

## E. Nové soubory

- `frontend/src/__tests__/realAccounts.test.ts` -- testy sjednocení identity (odvození iniciál, owner z profilu, idempotence, persistence).

## F. Upravené soubory

- `frontend/supabase_schema.sql` -- `profile_id`, join tabulky `project_members` + `card_assignees`, rozšířený trigger, backfill migrace.
- `frontend/src/types/kanban.ts` -- `TeamMember.profileId`.
- `frontend/src/services/workspaceService.ts` -- `profile_id` mapování, `deriveInitials`, `ownerMemberFromProfile`.
- `frontend/src/services/kanbanService.ts` -- relační čtení/zápis (`project_members`, `card_assignees`), `syncDbCardAssignees`, nested member mapping.
- `frontend/src/hooks/useKanbanBoard.ts` -- na startu zajistí owner člena z profilu (`profile` z `useAuth`).

## G. Dopad na architekturu

- **Uzavřený identitní model:** Profile → workspace member (owner) → project member → card assignee. Vše propojené vazbami, žádná duplicitní identita.
- **Normalizovaná data:** JSONB pole mají relační protějšky s FK a kaskádami; migrace převede stará data. To je přechod z prototypu na produkční datovou vrstvu.
- **Připraveno pro R24/R25:** relační tabulky jsou přesně to, na čem staví Realtime (subscribe na `card_assignees`/`project_members`) i budoucí Permissions (project_role, workspace_role).

## H. Co je demo-only vs. připraveno pro živou DB

- **Ověřeno v běhu (demo/localStorage):** owner člen z profilu, idempotence, board, členství, přiřazení.
- **Připraveno, ověřeno staticky (types/build/testy), ne živě:** relační Supabase čtení/zápis, trigger, backfill migrace. Po připojení Supabase (URL + anon key do `.env.local`) a spuštění `supabase_schema.sql` je vše aktivní; doporučuji pak jeden ruční smoke test.

## I. Kompatibilita (AI a ostatní)

- AI funkce čtou `card.assignee` / `card.assignees`, které dál fungují (mirror + resolve). `promptBuilder` test prochází.
- Ověřeno buildem (routes všech AI funkcí) a celou testovací sadou.

## J. Výsledek manuálního testování (demo režim)

Nový účet "Michael Beneš" (r23demo@example.com):
1. Po přihlášení se v modalu **Členové Workspace** objevil jako 5. člen -- "MB Michael Beneš r23demo@example.com".
2. V datech ověřeno: `workspaceRole: 'owner'`, `profileId` napojené na účet, deterministické id `member-owner-...`.
3. Po reloadu stále 5 členů, právě 1 owner -- **idempotentní**, žádný duplikát.
4. Board nového projektu naseedován (výchozí karty + řešitelé), ostatní R22 funkce beze změny.

## K. Výsledek lint

- `npm run lint`: **0 chyb, 0 varování**.

## L. Výsledek build

- `npm run build`: **úspěšný** (Compiled successfully, 14/14 stránek).

## M. Výsledek testů

- `npx vitest run`: **92/92 testů prošlo v 17 souborech** (88 předchozích + 4 nové R23 testy identity).

## N. Co ponechat na další release

- **R24 Realtime:** subscribe na `project_members` / `card_assignees`; optimistické mutace s rollbackem; frakční pozice (lexorank) pro drag&drop bez konfliktů.
- **Invite Members / Permissions:** `profile_id` a role jsou připravené -- doplnit accept-flow pozvánek a vynucení rolí (RLS + UI).
- **Úklid JSONB:** až bude relační cesta ověřená proti živé DB, lze denormalizovaný mirror (member_ids / assignees) zredukovat nebo zrušit.

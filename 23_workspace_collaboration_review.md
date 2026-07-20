# Review Release 22 - Workspace Collaboration

Tento release zavádí dvě úrovně členství: **Workspace Members** (identita napříč celou aplikací) a **Členové projektu** (podmnožina vybraná z workspace). Nejde o novou AI funkci -- jde o správné oddělení Workspace a Projektu jako základ pro budoucí spolupráci. Stavěno nad datovou vrstvou z Release 21, bez rozsáhlého refaktoringu.

---

## Architecture Check (výsledek ověření základů z R21)

R21 vytvořil vhodný základ: typ `TeamMember` je znovupoužitelný jako identita, persistence má čistý dual-path vzor (`localStore` + Supabase), mapování je centralizované a chyby se hlásí přes `persistenceStatus`. Jediná chybějící vrstva byla nadřazená úroveň nad projektem. R22 ji doplňuje, aniž by přepisoval hotový kód:

- **Znovupoužito:** `TeamMember` jako identita, `persistenceStatus`, `localStore`, mapovací utility v `utils/assignees.ts`.
- **Nová jednodušší cesta místo kaskád:** místo ručního kaskádového přepisování řešitelů na kartách (R21) se řešitelé nově **re-resolvují při načtení** proti aktuálním členům projektu (`resolveBoardAssignees`). Úprava jména/barvy i odebrání člena se tak projeví automaticky, bez zápisů do všech karet. To zjednodušilo `kanbanService` (odstraněny tři pomocné funkce) a zároveň vynucuje pravidlo "úkol jen členům projektu" konstrukčně.

## A. Architektura Workspace Members

- **Zdroj identity:** `workspaceService` (nový) spravuje jediný seznam členů workspace (= účtu vlastníka). Add / edit / delete / fetch, dual-path:
  - Demo režim: `localStorage['kanban_workspace_members']`.
  - Supabase režim: tabulka `workspace_members` (scoped přes `owner_id`, RLS `auth.uid() = owner_id`).
- **Seed:** při prvním načtení se workspace naplní výchozími členy (`DEFAULT_MEMBERS`).
- **UI:** `WorkspaceMembersModal` otevíraný z Navbaru ("Tým"). Zde vznikají, upravují se a mažou identity.

## B. Architektura Členů projektu

- **Členství jako reference, ne kopie:** `Project.memberIds: string[]` -- pole odkazů na `workspace_members`. Projekt nikdy nevytváří novou identitu, pouze vybírá podmnožinu.
- **Odvození:** hook `useKanbanBoard` počítá `teamMembers` (členové projektu) = `workspaceMembers.filter(id ∈ memberIds)`. Všichni dosavadní spotřebitelé (`MultiAssigneeSelect`, `Toolbar`, `AddCardModal`, `TaskDetailDrawer`) dostávají členy projektu beze změny signatur.
- **UI:** `ProjectMembersModal` (nový) otevíraný z řádku avatarů pod Hero sekcí. Zaškrtávací seznam členů workspace s okamžitou (optimistickou) perzistencí. Obsahuje odkaz "Spravovat Workspace".

## C. Datový model

- `TeamMember` (identita): doplněno připravené pole `workspaceRole?: 'owner' | 'admin' | 'member'` (zatím bez vynucení).
- Nové typy `WorkspaceRole`, `ProjectRole` (připraveno pro Permissions).
- `Project`: přidáno `memberIds?: string[]`. Legacy `teamMembers?` ponecháno jen pro zpětnou kompatibilitu a jednorázovou migraci.
- SQL: nová tabulka `workspace_members`; sloupec `projects.member_ids JSONB`. Vše idempotentní.
- **Migrace:** starší projekt z R21 (má `team_members`, nemá `member_ids`) se při načtení převede -- jeho členové se doplní do workspace (`ensureMembers`, union dle id) a `member_ids` se odvodí a uloží. Projekt bez členství dostane všechny členy workspace.

## D. Rozdělení Workspace vs Projekt

| | Workspace Members | Členové projektu |
|---|---|---|
| Co představuje | všechny identity v aplikaci | podmnožina pro daný projekt |
| Otevírá se z | Navbar → "Tým" | řádek avatarů → "Členové projektu" |
| Komponenta | `WorkspaceMembersModal` | `ProjectMembersModal` |
| Operace | vytvořit / upravit / smazat identitu | zaškrtnout / odškrtnout členství |
| Úložiště | `workspace_members` / localStorage | `projects.member_ids` |
| Vytváří uživatele? | ano (identitu) | ne (jen vybírá) |

Přiřazení úkolu je omezené na členy projektu: `MultiAssigneeSelect` dostává `teamMembers` (členy projektu), a řešitelé se při načtení resolvují proti nim -- kdo není členem projektu, z nabídky i z karet zmizí.

## E. Nové soubory

- `frontend/src/services/workspaceService.ts` -- CRUD členů workspace (dual-path).
- `frontend/src/components/board/WorkspaceMembersModal.tsx` -- správa identit (Navbar).
- `frontend/src/components/board/ProjectMembersModal.tsx` -- výběr členů projektu z workspace.

## F. Upravené soubory

- `frontend/supabase_schema.sql` -- tabulka `workspace_members`, sloupec `projects.member_ids`.
- `frontend/src/types/kanban.ts` -- role, `workspaceRole`.
- `frontend/src/services/kanbanService.ts` -- `memberIds` v modelu, `setProjectMembers`; odstraněny per-projektové identity metody a kaskády (nahrazeny re-resolve na čtení).
- `frontend/src/services/storage/localStore.ts` -- `setProjectMembers` místo lokálních team metod.
- `frontend/src/utils/assignees.ts` -- `resolveAssignees`, `resolveBoardAssignees`.
- `frontend/src/hooks/useKanbanBoard.ts` -- `workspaceMembers`, odvození členů projektu, migrace, akce `addWorkspaceMember` / `editWorkspaceMember` / `deleteWorkspaceMember` / `setProjectMembers`.
- `frontend/src/app/projects/[projectId]/page.tsx` -- dva modaly, wiring Navbar/Toolbar.
- `frontend/src/components/toolbar/Toolbar.tsx` -- popisek "Tým" → "Členové projektu".
- `frontend/src/__tests__/teamManagement.test.tsx` -- přepsáno na dvouúrovňový model.
- Odstraněn `frontend/src/components/board/TeamManagementModal.tsx` (nahrazen dvěma modaly).

## G. UX rozhodnutí

- Dva modaly sdílejí stejný designový jazyk (overlay, avatary, barevná paleta ze `strategy.md`), takže Workspace i Projekt působí jako jeden systém.
- `ProjectMembersModal` používá zaškrtávací dlaždice s tlumeným avatarem u neaktivních členů a okamžitou perzistenci (bez tlačítka Uložit) -- svižný, moderní pocit.
- Přidání člena do workspace jej záměrně **nepřidá** automaticky do projektu (ověřeno: stav "4/5"). Do projektu se přidává vědomě.
- `ProjectMembersModal` odkazuje na správu workspace ("Spravovat Workspace"), takže tok "chci nového člověka" má jasnou cestu.

## H. Připravenost na Invite Members

- Identita je oddělená od projektu a scoped přes `owner_id` -- pozvánka v budoucnu jen naváže `workspace_members.id` na reálný `profiles.id` (účet). Model se nemusí měnit, přibude jen stav "pending/accepted".
- `email` už na členovi existuje -- přirozený klíč pro pozvánku.

## I. Připravenost na Permissions

- `WorkspaceRole` (`owner`/`admin`/`member`) a `ProjectRole` (`owner`/`member`) jsou zavedené jako typy; `workspace_members.workspace_role` má DB sloupec i CHECK. Nic se zatím nevynucuje -- vynucení (RLS politiky, UI guardy) je čistě aditivní krok pro R23.

## J. AI kompatibilita

AI funkce čtou `card.assignee` / `card.assignees`, které zůstávají plně funkční (řešitelé se jen resolvují proti členům projektu). Ověřeno:
- `promptBuilder` test s multi-assignee kartou prochází.
- AI Improve Task, Generate Tasks, Generate Project, Sprint Planner, Risk Analysis, AI History -- beze změny rozhraní; všechny odpovídající testovací sady zelené a produkční build zkompiloval jejich routes.

## K. Výsledek manuálního testování

Ověřeno v prohlížeči (demo režim, nový účet):

1. **Workspace -- vytvoření člena:** Navbar "Tým" otevřel `Členové Workspace`; přidán "Petra Nováková" → 5 členů workspace.
2. **Workspace -- editace/mazání:** tlačítka Upravit/Odstranit u každého člena funkční (CRUD pokryto i unit testy).
3. **Oddělení Workspace vs Projekt:** po přidání do workspace ukazoval `Členové projektu` stav "4 / 5" -- nový člen se do projektu nepřidal automaticky.
4. **Projekt -- přidání člena:** zaškrtnutí Petry ji přidalo do projektu; okamžitě se objevila v řádku avatarů i v nabídce řešitelů.
5. **Projekt -- odebrání člena:** po odebrání Sarah Chen z projektu se u jejích karet ("Konfigurace CI/CD", "Refaktorovat správu stavu") zobrazilo "--" (řešitel odebrán).
6. **Restrikce přiřazení:** v detailu úkolu nabízel `MultiAssigneeSelect` pouze 4 členy projektu (Alex, Marcus, Elena, Petra); Sarah Chen nebyla v nabídce.
7. **Persistence po reloadu:** po znovunačtení boardu zůstalo členství i odebrání řešitelů zachováno.

Poznámka: prostředí běží v demo režimu (bez Supabase údajů v `.env.local`). Supabase větve (`workspace_members`, `member_ids`) jsou ověřeny typovou kontrolou, buildem a review; po nasazení schématu doporučuji jeden ruční smoke test v produkčním režimu.

## L. Výsledek lint

- `npm run lint`: **0 chyb, 0 varování**.

## M. Výsledek build

- `npm run build`: **úspěšný** (Compiled successfully, 14/14 stránek).

## N. Výsledek testů

- `npx vitest run`: **88/88 testů prošlo v 16 souborech** (84 předchozích + nové/přepsané testy: workspace CRUD, `ensureMembers` union, členství projektu, restrikce přiřazení přes `resolveBoardAssignees`, obnova identity, AI kompatibilita).

## O. Co ponechat na další release

- **Invite Members / User Accounts:** navázat `workspace_members` na reálné `profiles` (accept flow, stav pozvánky).
- **Permissions:** vynutit role (RLS + UI guardy) -- typy a DB sloupec připraveny.
- **Normalizace:** `member_ids` a `assignees` z JSONB do relačních tabulek (`project_members`, `card_assignees`), až bude identita navázaná na účty.
- **Realtime / Notifications / Chat:** stavět nad touto vrstvou.

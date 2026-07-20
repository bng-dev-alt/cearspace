# Review - Samostatná stránka Tým (Workspace Members)

Nahrazení stísněného modalu „Členové Workspace" plnohodnotnou stránkou `/team` s rozšířenými poli (Varianta A z plánu). Bez změny workflow boardu, AI, projektů ani datového modelu (jen doplněn 1 sloupec pro titul).

## Co bylo špatně (výchozí stav)

- Malý modal s **vnitřním scrollem** u 7+ členů (stísněné).
- **Slabá hierarchie** — nešlo poznat vlastníka od člena, ač roli v datech máme.
- **Skrytá metadata** — role, datum přidání, vazba na účet, titul se nikde nezobrazovaly.
- Nav „Tým" byl **hack** (custom event + localStorage flag + otevření modalu na boardu).

## Co bylo implementováno

- **Nová stránka `/team`** ve stylu ostatních stránek: sdílená hero sekce (ocean, „WORKSPACE / Tým") → toolbar (počet členů · **hledání** · „Přidat člena") → **tabulka členů**, která roste dolů (dokumentový scroll, žádný vnitřní scroll).
- **Rozšířené položky u člena:** avatar · jméno · **titul/pozice** · e-mail · **role badge** (Owner/Admin/Member) · **stav účtu** (chip „Účet" u napojených / „Kontakt" u placeholderů) · **počet projektů** (dopočítáno) · **datum přidání** · akce.
- **Owner odlišen:** teal badge „Owner", zelený chip „Účet", **smazání zakázáno** (nelze odebrat vlastníka).
- **Add/Edit** v samostatném `MemberFormModal` s novými poli **Pozice/titul** a **výběrem role** (Member/Admin; owner má roli pevně). Escape zavírá.
- **Nav „Tým" → route `/team`** (konec event-hacku), s active stavem.
- **ProjectMembersModal** „Spravovat Workspace" nově naviguje na `/team`.

## Nové soubory

- `hooks/useWorkspaceMembers.ts` — správa členů nezávislá na projektu: fetch + zajištění ownera z profilu + dopočet projektů na člena + CRUD.
- `components/team/MembersTable.tsx` — tabulka s rozšířenými poli.
- `components/team/MemberFormModal.tsx` — add/edit formulář (titul + role).
- `app/team/page.tsx` — stránka (hero + toolbar + tabulka + modal).

## Upravené soubory

- `components/layout/Navbar.tsx` — „Tým" → `/team` + active stav; zjednodušený handler.
- `app/projects/[projectId]/page.tsx` — odstraněn WorkspaceMembersModal, event listener a localStorage flag; „Spravovat Workspace" → `/team`.
- `services/workspaceService.ts` — mapování + persistence **titulu** (`job_title`); `addMember` nově nese `role`.
- `supabase_schema.sql` — sloupec `workspace_members.job_title` (idempotentně).
- `app/globals.css` — tokenizované styly tabulky/stránky (light i dark), responsivní varianta (na mobilu se tabulka stackuje s popisky sloupců).

## Odstraněno

- `components/board/WorkspaceMembersModal.tsx` — nahrazeno stránkou (dead code).
- Event `open-team-management` + flag `open_team_modal_on_load` (nahrazeno routou).

## Opravený bug (nalezen při ověření)

Nové pole **Pozice/titul se neukládalo** — `workspaceService.addMember` sestavoval nového člena bez `role` a chyběl DB sloupec. Opraveno: `addMember` nese `role`, přidán sloupec `job_title` + mapování (`mapDbMember`/`memberToDbRow`). Ověřeno v prohlížeči: po úpravě člena se titul zobrazí v řádku a přežije reload.

## Ověření (demo, dark i light)

- Tabulka se všemi rozšířenými poli; owner (Michael Beneš) s badge „Owner" + chip „Účet" + zakázaným smazáním; ostatní jako „Member" + „Kontakt".
- **Přidání** člena (Petra Nováková) — objevil se v tabulce.
- **Úprava** — titul „Product Designer" se uložil a zobrazil (po reloadu drží).
- **Hledání**, počet projektů, datum přidání, dark i light režim — vše funkční, konzole bez chyb.

## Výsledky

- `npm run lint`: **0 chyb, 0 varování.**
- `npm run build`: **úspěšný** (Compiled + TypeScript OK, 15 stránek vč. `/team`).
- `npx vitest run`: **92/92 testů prošlo v 17 souborech.**

## Mimo tento krok (post-1.0)

Skutečné pozvánky e-mailem, vynucování rolí/oprávnění, online/last-active stavy — pole jsou připravená, jen se neaktivují.

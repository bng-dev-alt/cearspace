# Review - Kalendář (per-project view, MVP)

Nová funkce: kalendářové zobrazení úkolů podle termínu (`dueDate`), jako druhý pohled na projekt vedle Kanban boardu. Rozsah dle dohody: **MVP, per-projekt, klik na kartu otevře stávající drawer.** Bez změny datového modelu, workflow, DnD, AI ani Theme Systému.

## Architektura (nejčistší varianta, bez duplicit)

- **View toggle místo nové stránky/route.** Přidán segmentovaný přepínač **Board | Kalendář** nad plochou boardu (standardní vzor projektových views jako v Linear/ClickUp/Notion). Zvolený pohled se **ukládá do localStorage** (`board_view_mode`).
- **Nulová duplicita logiky.** Kalendář běží na stejném `useKanbanBoard(projectId)` a klik na kartu volá **stávající** `handleOpenDrawer(columnId, card)` -> otevře se tentýž `TaskDetailDrawer` jako z boardu, se všemi handlery (úprava, přesun, checklist, komentáře, aktivita). Žádné kopírování wiring kódu.
- **Bez změny dat.** Karty už mají `dueDate`; kalendář data jen čte a seskupuje. Žádná migrace, žádné nové pole.

## Nové soubory

- `frontend/src/components/board/CalendarView.tsx` -- čistá prezentační komponenta: měsíční mřížka (týdny od pondělí, CZ), karty na svém termínu, navigace měsíců, `onCardClick`.

## Upravené soubory

- `frontend/src/app/projects/[projectId]/page.tsx` -- stav `viewMode` (+ persistence) a `calendarMonth`, přepínač Board/Kalendář, podmíněný render `CalendarView` vs `BoardPanel`; klik na kartu sdílí stávající drawer.
- `frontend/src/app/globals.css` -- tokenizované styly kalendáře a přepínače (`.calendar-*`, `.view-switch`), responsivní varianta pro mobil.
- `frontend/src/utils/kanban.ts` -- drobný cleanup: `getPriorityColor` u priority High vrací `var(--danger)` místo natvrdo `#ef4444` (konzistence s tokeny/motivem).

## Chování / UX

- **Měsíční mřížka** s českými zkratkami dnů (Po–Ne), týden začíná pondělím.
- **Karty na dni termínu** jako kompaktní chip s tečkou dle priority a názvem (ellipsis). Klik otevře detail (drawer).
- **Dnešek** zvýrazněn akcentovým kolečkem; dny sousedních měsíců ztlumené.
- **Přetečení dne:** max 3 karty + „+N další".
- **Navigace:** předchozí / další měsíc + „Dnes".
- **Úkoly bez termínu** se v kalendáři nezobrazují; počet je uveden v patičce (transparentně).
- **Motiv:** plně tokenizováno -> funguje v light i dark (ocean) bez lokálních barev.
- **Scroll:** kalendář je součástí dokumentového scrollu (konzistentní se scroll reworkem); roste s obsahem.

## Ověření (demo, dark i light)

- Přepínač Board ↔ Kalendář funguje, volba se pamatuje po reloadu.
- Všech 7 výchozích karet se zobrazilo na správných dnech (termíny v červenci 2026), tečky priorit správně (High červená, Medium žlutá, Low modrá/teal).
- Dnešní den (19.) zvýrazněn.
- Klik na kartu v kalendáři otevřel stejný `TaskDetailDrawer` jako z boardu.
- Ověřeno v **dark (ocean)** i **light** motivu; konzole bez chyb.
- Board, DnD, AI funkce beze změny.

## Co je vědomě mimo MVP (kandidáti na další iteraci)

- **Drag karty na jiný den** = změna termínu (přepoužilo by se `editCard`).
- **Workspace-wide kalendář** (napříč projekty).
- Klik na „+N další" pro rozbalení všech karet dne.

## Výsledky

- `npm run lint`: **0 chyb, 0 varování.**
- `npm run build`: **úspěšný** (Compiled + TypeScript OK, 14/14 stránek).
- `npx vitest run`: **92/92 testů prošlo v 17 souborech.**

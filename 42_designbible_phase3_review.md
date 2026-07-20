# Design Bible — Fáze 3: Board + chrome

Povýšení hlavní obrazovky (Kanban board) a globálního chrome do premium „creative workspace" vzhledu. **Kanban UX, drag & drop a všechny funkce zachovány beze změny** — refinement je čistě na úrovni CSS tříd (markup a handlery karet/sloupců se nedotkly).

## Co bylo upraveno

### Karty (`.card`)
- Radius `8px` (natvrdo) → **`var(--radius-card)` (18px)** — sladěno s Design Bible, zaoblenější/premium.
- Stín → `var(--shadow-sm)`, transition → `var(--transition-base)` (Bible motion).
- **Hover:** lift + `var(--shadow-md)` + **emerald border** (`var(--accent)`) místo šedé — jasnější, prémiovější odezva.
- Sklo (glass-bg-2, 90 % opacity z Fáze 0) ponecháno.

### Sloupce
- **Počítadlo karet** `.column-card-count`: šedá pilulka → **emerald** (`--accent-soft` bg + `--accent` text), `radius-full`, tabular čísla.
- `.column-header-plus:hover`: opraven starý **modrý** tint (`rgba(32,157,215,…)`) → `var(--accent-soft)`.

### Chrome — sjednocení focus stavů
- Focus glowy na inputech/searchi napříč globals: staré **modré** `rgba(32,157,215,…)` → **`var(--accent-soft)`** (emerald). Konzistentní focus napříč toolbarem, filtry, formuláři.

### Stats
- Už z Fáze 1 na sdílené `MetricCard` (emerald ikony, „Vyřešit →").

### Navbar / Hero / Toolbar
- Nesou nový systém už z Fáze 0 (emerald akcent, radius scale, glass, Fraunces hero nadpis). V této fázi navíc opraveny modré focus/hover tinty. Layout beze změny.

## Změněné soubory
- `src/app/globals.css` — `.card` (radius/shadow/hover), `.column-card-count`, `.column-header-plus:hover`, sjednocení modrých focus glowů na `--accent-soft`.

## Důležitá rozhodnutí
- **Board refinement přes CSS třídy, ne markup.** KanbanCard/Column jsou class-based → styl se ladí v globals bez dotyku na `draggable`/handlery → **drag & drop 100 % zachován** (ověřeno E2E).
- Modré/fialové tinty v **AI modalech** (GenerateProject/Sprint/Tasks) ponechány na **Fázi 5/6** (jejich doména), aby Fáze 3 zůstala ohraničená na board+chrome.

## Odchylky od Design Bible
- Žádné. Hero/Toolbar/Navbar dostaly hlubší token-level úpravu už ve Fázi 0; zde jen sjednocení focus stavů. Pokud bude chtít uživatel dedikovaný micro-polish hera/toolbaru, přidá se samostatně.

## Ověření
- Board **Dark i Light** v prohlížeči: emerald count pilulky, zaoblenější karty, emerald hover, cohesivní chrome. Layout beze změny.
- **E2E `npm run test:e2e`: 6/6** (drag&drop, add card, rename, Project Intelligence, ⌘I) — funkce zachovány.
- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npm run build`: **úspěšný**.

## Dál (Fáze 4)
Projekty + Kalendář: projektové karty v jazyce boardu, glass povrchy kalendáře (event karty, sidebar, grid, selected/hover).

# Review 07 -- Productivity, Advanced Filters & Archive Review

Tento dokument shrnuje architektonické změny, nové funkce a optimalizace provedené za účelem zvýšení každodenní produktivity práce s boardem (vyhledávání, pokročilé filtry, řazení, klávesové zkratky, plynulost Drag & Drop a výkonnostní optimalizace).

---

## 1. Soubory dotčené změnami

### Nové soubory
- [`frontend/src/__tests__/productivity.test.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/productivity.test.tsx) — Integrační a unit testy pokrývající chování klávesových zkratek, komplexní logiku vyhledávacího a filtračního enginu, řazení a chování archivace úkolů.

### Upravené soubory
- [`frontend/src/types/kanban.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/types/kanban.ts) — Rozšíření rozhraní `Card` o nepovinná metadata `archived?: boolean`, `createdAt?: string` a `updatedAt?: string`.
- [`frontend/supabase_schema.sql`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/supabase_schema.sql) — Migrační příkazy pro přidání sloupců `archived`, `created_at` a `updated_at` do tabulky `cards` v Supabase.
- [`frontend/src/services/kanbanService.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/kanbanService.ts) — Úprava CRUD a seed metod pro ukládání a načítání nových metadat a stavu archivace. Zavedení metody `archiveCard` pro zapsání stavu archivace do databáze/localStorage.
- [`frontend/src/hooks/useKanbanBoard.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/hooks/useKanbanBoard.ts) — Refaktoring metody `getProcessedColumns` na komplexní vyhledávací, filtrační a řadicí engine. Přepsání `deleteCard` na bezpečné nastavení stavu archivace.
- [`frontend/src/components/toolbar/Toolbar.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/toolbar/Toolbar.tsx) — Rozšíření uživatelského rozhraní o dropdown filtry pro sloupce, řešitele, termíny, checklisty, komentáře a archivované karty. Doplnění řazení.
- [`frontend/src/app/projects/[projectId]/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/projects/%5BprojectId%5D/page.tsx) — Integrace a propojení nových stavů Toolbaru s vyhledávacím enginem. Zavedení globálního hooku pro správu klávesových zkratek s ošetřením aktivního psaní v polích.
- [`frontend/src/components/board/KanbanCard.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/KanbanCard.tsx) — Optimalizace re-renderů zabalením komponenty karty do `React.memo`.
- [`frontend/src/app/globals.css`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/globals.css) — Přidání CSS pravidel stabilizujících chování Drag & Drop a eliminujících problikávání sloupců.
- [`frontend/src/__tests__/kanban.test.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/kanban.test.tsx) — Přidání mocku pro metodu `archiveCard`.

---

## 2. Detaily a architektura implementace

### Globální vyhledávání (Search)
- **Rozsah**: Vyhledávání probíhá okamžitě během psaní (reaktivně v Reactu) a prohledává data napříč všemi sloupci aktuálního projektu.
- **Prohledávaná pole**: Algoritmus vyhledává shodu (case-insensitive) v názvu úkolu (`title`), popisu (`details`), textu jednotlivých položek checklistu (`checklist.text`) a obsahu všech komentářů k danému úkolu (`comments.content`).
- **Příprava na fulltext**: Filtrační engine v `useKanbanBoard.ts` odděluje textový dotaz od ostatních parametrů. V budoucí fázi lze toto vyhledávání snadno nahradit voláním Supabase API (např. pomocí dotazu `.textSearch('fts_column', query)`), pokud se nad tabulkou vygeneruje indexovaný sloupec pro fulltextové vyhledávání.

### Kombinovatelné pokročilé filtry & Collapsible Panel (Filtry)
- **Collapsible Design**: Abychom zamezili přeplnění uživatelského rozhraní mnoha selektory současně, skryli jsme pokročilé filtry do jediného elegantního tlačítka **Filtry** v Toolbaru. Kliknutím na toto tlačítko se pod hlavní lištou plynule vysune/zasune panel obsahující všechny selektory filtrů.
- **Aktivní badge**: Na tlačítku se zobrazuje dynamický badge s celkovým počtem právě aktivních filtrů (např. **Filtry (2)**), takže má uživatel neustále přehled o stavu zobrazení.
- **Tlačítko Vymazat filtry**: Pokud je aktivní alespoň jeden filtr, vedle tlačítka se zobrazí odkaz s ikonou pro rychlý reset všech filtrů na výchozí hodnoty.
- **Kombinování filtrů**: Všechny filtry se aplikují současně (jako logický operátor `AND`):
  1. **Priorita**: Low, Medium, High.
  2. **Status/Sloupec**: Možnost zobrazit pouze vybraný sloupec na boardu.
  3. **Řešitel**: Zobrazení úkolů konkrétního člena týmu nebo nepřiřazených úkolů.
  4. **Termín splnění**: Dynamické vyhodnocení termínů (Dnes, Tento týden, Po termínu, Bez termínu).
  5. **Přítomnost checklistu & komentářů**: Filtrování na základě toho, zda úkoly obsahují alespoň jednu položku checklistu / komentář.
  6. **Archivované úkoly**: Přepínání mezi aktivními (výchozí), archivovanými nebo všemi kartami.

### Bezpečné archivování (Archive)
- Uživatelé již nemohou kartu smazat okamžitě natvrdo. Tlačítko pro smazání v rozhraní vyvolá akci archivace, která nastaví příznak `archived: true` v localStorage nebo Supabase.
- Archivované karty se automaticky odfiltrují z boardu.
- Pro budoucí implementaci stránky **Archiv** je vše připraveno – rozhraní i databázové schema již plně podporují segmentaci na aktivní a archivované položky.

### Klávesové zkratky (Keyboard Shortcuts)
Implementovali jsme bezpečný globální posluchač událostí na objektu `window`, který omezuje spouštění zkratek, pokud má focus jakýkoliv editovatelný prvek (`input`, `textarea`, `select`, `contentEditable`):
- **`N` / `n`** — Spustí otevření modálu pro vytvoření nové karty (přiřadí ji do prvního sloupce).
- **`/`** — Okamžitě zaměří a vybere text v globálním vyhledávacím poli v Toolbaru.
- **`Esc`** — Zavře Side Drawer s detaily úkolu nebo jakýkoliv otevřený modál.
- **`Ctrl/Cmd + Enter`** — Uloží aktuálně rozepsanou hodnotu v Side Drawer panelu (odebere focus z aktivního elementu, což vyvolá `onBlur` a uloží změnu).

---

## 3. Optimalizace výkonu (Performance Review)

1. **Memoizace karet (`React.memo`)**:
   Board může obsahovat desítky až stovky karet. Obalení `KanbanCard` do `React.memo` zabraňuje re-renderování všech karet při každém stisku klávesy ve vyhledávání nebo při změně libovolného filtru v Toolbaru. Karty se překreslí pouze tehdy, pokud se skutečně změní jejich vnitřní props (např. při editaci).
2. **Memoizace referencí (`useCallback` / `useMemo`)**:
   - Transformační a filtrační metoda `getProcessedColumns` v hooku `useKanbanBoard` je memoizována pomocí `useCallback`.
   - Event handlery a callbacks v `page.tsx` (`handleCloseDrawer`, `handleOpenGeneralAddModal`) byly obaleny do `useCallback`, aby nedocházelo k vytváření nových instancí při každém re-renderu a zbytečnému vyvolávání efektů.
3. **Stabilizace Drag & Drop**:
   Přidáním CSS pravidla `.column.drag-over * { pointer-events: none; }` se eliminoval flickering (rychlé problikávání stylů a stavů), který nastával, když uživatel přetahoval kartu přes jiné karty v cílovém sloupci a prohlížeč generoval konfliktní události `dragenter` a `dragleave`.

---

## 4. Doporučení pro další milestone

1. **Stránka Archiv**:
   Vytvořit dedikovanou stránku (např. `/projects/[projectId]/archive`), která načte archivované karty (`archived = true`) a umožní jejich hromadné obnovení zpět na board nebo definitivní odstranění z databáze.
2. **Přechod na Databázový Fulltext (Supabase FTS)**:
   Při nárůstu počtu úkolů (nad stovky) bude klientské filtrování zpomalovat. Doporučujeme vytvořit generovaný sloupec `fts` typu `tsvector` nad tabulkami `cards`, `task_checklists` a `task_comments` a vyhledávání provádět přímo na databázové úrovni.
3. **Indikátor klávesových zkratek v UI**:
   Přidat do rozhraní drobné nápovědy (např. šedou značku `/` vedle vyhledávacího pole a zkratku `Esc` k zavíracímu křížku v Side Drawer), aby se zvýšila povědomost uživatelů o těchto funkcích.

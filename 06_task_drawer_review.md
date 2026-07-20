# Review 06 -- Task Detail Workspace & UX Layout Review

Tento dokument shrnuje architektonické změny, nové vlastnosti a vylepšení uživatelského rozhraní provedené v rámci přepracování detailu úkolu (Side Drawer) a optimalizace chování Kanban boardu.

---

## 1. Přehled vytvořených a upravených souborů

### Nové soubory
- [`frontend/src/components/board/TaskDetailDrawer.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/TaskDetailDrawer.tsx) — Komponent pravého Side Drawer panelu sdružující inline editaci, checklist, komentáře, aktivity a přípravu na AI.
- [`frontend/src/__tests__/drawer.test.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/drawer.test.tsx) — Unit testy pokrývající otevírání panelu, inline editaci vlastností, správu checklistu, přidávání komentářů a historii aktivit.

### Upravené soubory
- [`frontend/src/types/kanban.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/types/kanban.ts) — Rozšíření datového modelu o rozhraní `ChecklistItem`, `Comment`, `ActivityLog` a integraci těchto polí do rozhraní `Card`.
- [`frontend/src/app/globals.css`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/globals.css) — Přidání kompletního stylopisu pro Side Drawer panel, checklisty, komentáře, timeline aktivit a AI kartu; oprava výškového rozvržení boardu (viewport boundary), hover-sbalování karet, vizuální zvýraznění čítačů a trvalých posuvníků.
- [`frontend/src/services/kanbanService.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/kanbanService.ts) — Rozšíření načítání `fetchBoardData` o nested join dotazy na data checklistů, komentářů a aktivit; doplnění mutačních metod.
- [`frontend/src/hooks/useKanbanBoard.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/hooks/useKanbanBoard.ts) — Refaktoring `editCard` pro podporu částečných (`Partial<Card>`) aktualizací, zavedení mutačních funkcí pro checklist, komentáře a automatické porovnávání/logování změn do historie aktivit.
- [`frontend/src/app/projects/[projectId]/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/projects/%5BprojectId%5D/page.tsx) — Integrace `TaskDetailDrawer` komponenty, přidání reaktivního mapování vybrané karty, implementace vynuceného remountu přes `key={selectedCard.id}` a odstranění starého `EditCardModal`.
- [`frontend/src/__tests__/kanban.test.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/kanban.test.tsx) — Aktualizace integračního testu editace karty pro nové chování Side Drawer panelu (auto-save na blur a nepřítomnost submit tlačítka).
- [`frontend/supabase_schema.sql`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/supabase_schema.sql) — Doplnění SQL DDL definic pro tabulky `task_checklists`, `task_comments` a `task_activities` včetně nastavení RLS politik na úrovni vlastníka projektu.

---

## 2. Architektonické změny & Detaily implementace

### Oprava zasekávání (Auth Login Loading)
- **Problém**: V `AuthContext.tsx` při úspěšném přihlášení nebo registraci chybělo nastavení `setIsLoading(false)`, což drželo aplikaci v nekonečném stavu načítání na chráněných cestách.
- **Oprava**: Volání `setIsLoading(false)` bylo doplněno na konce úspěšných bloků funkcí `login` a `register`.

### Task Side Drawer Workspace
- **Layout**: Panel se otevírá na pravé straně s pevnou šířkou (max. 620px) nad polo-průhledným a rozostřeným overlayem (`backdrop-filter: blur(2px)`). Celý board na levé straně zůstává plně viditelný a kliknutím na něj se panel bezpečně uzavře.
- **Čisté stavy (React Mount Key)**: V komponentě `page.tsx` se drawer vykresluje s dynamickým klíčem `key={selectedCard.id}`. To zaručuje, že při překliknutí na jinou kartu React automaticky unmountne starý a mountne nový panel, čímž se spolehlivě resetují a nově naplní všechny lokální editační stavy bez nutnosti složitých a chybových synchronizačních `useEffect` bloků.
- **Inline Editing & Auto-save**: Pro název a popis (velký multiline editor) se změny ukládají na událost `onBlur` (po ztrátě focusu), čímž minimalizujeme síťové zápisy. Pro status, prioritu, řešitele, štítky a termíny splnění se změny ukládají okamžitě při změně hodnoty (`onChange`).

### Datový model & Databáze
Pro produkční nasazení v Supabase byly navrženy a do souboru `supabase_schema.sql` přidány tři tabulky:
- `task_checklists`: id (text), card_id (text references cards), text (text), completed (boolean).
- `task_comments`: id (text), card_id (text references cards), author_name (text), content (text), created_at (timestamp).
- `task_activities`: id (text), card_id (text references cards), text (text), created_at (timestamp).
Všechny tabulky mají nastaveno `ON DELETE CASCADE` pro automatickou čistku dat po smazání karty a jsou chráněny RLS politikami (ověření vlastnictví projektu přes cizí klíče).
V offline fallback režimu se tato pole ukládají serializovaná přímo uvnitř JSON objektu karty v `localStorage`.

### Checklist, Komentáře & Aktivity
- **Checklist**: Zobrazuje seznam položek s možností přidání, úpravy textu, označení jako hotové a smazání. Nad checklistem se nachází dynamický progress bar (grafický ukazatel) doprovázený textem (např. `2 / 3 splněno`).
- **Komentáře**: Jednoduché diskusní vlákno s chronologickým řazením a zobrazením jména autora a přesného data/času přidání.
- **Historie aktivit**: Automaticky zaznamenává jakoukoli důležitou změnu. Změny jsou detekovány v hooku `useKanbanBoard` porovnáním předchozího a nového stavu a logovány chronologicky.

---

## 3. Vylepšení rozvržení a UX karet na boardu

### Fixace výšky (Viewport boundary)
- **Problém**: Výška boardu se dříve nekontrolovaně natahovala podle počtu karet, což nutilo uživatele scrollovat celou stránku dolů a schovávalo záhlaví sloupců.
- **Oprava**: Přidán styl `min-height: 0;` na kontejner `.board-panel-card` a `.app-container { height: 100vh; overflow: hidden; }`. Celý board se nyní přesně přizpůsobí výšce obrazovky, globální posuvník stránky je odstraněn a sloupce scrollují nezávisle na sobě.

### Kompaktní zobrazení s hover efektem
- **Problém**: Karty byly příliš vysoké a zabíraly moc místa, takže se do sloupce vešlo málo úkolů.
- **Oprava**: Popis karty (`.card-details`) je ve výchozím stavu sbalený (skrytý s nulovou výškou a průhledností). Při najetí myší na kartu se popis plynule a hladce rozbalí dolů. Karty jsou tak standardně velmi malé a přehledné.

### Kontrastnější čítače a posuvníky
- **Badge čítačů**: Číselné indikátory počtu karet v záhlaví sloupců byly změněny na výrazné oválné badges (pills) s pozadím `#e4e3e0` a tmavým textem `var(--dark-navy)`.
- **Safari Scrollbars**: Přizpůsobeno stylování posuvníků `.cards-list::-webkit-scrollbar` pro trvalé zobrazení a zvýšenou viditelnost v Safari na macOS.

---

## 4. Ověření a testy
Všechny provedené úpravy byly ověřeny a jsou plně stabilní:
- Spuštění integračních testů: `npm run test` (všech 26 testů v 4 testovacích souborech prošlo bez chyb).
- Kontrola linteru: `npm run lint` (0 chyb, 0 varování).
- Produkční sestavení: `npm run build` (sestavení Next.js proběhlo úspěšně).

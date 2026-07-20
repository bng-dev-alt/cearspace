# Review 04 -- Project Management & Isolation Review

Tento dokument představuje review (posouzení) a report z dokončení správy projektů, lokalizace statistik a plné izolace dat v aplikaci Kanban Board.

---

## 1. Provedené změny v souborech

*   **Změněné soubory:**
    *   [`src/services/kanbanService.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/kanbanService.ts) – Přidány metody `deleteProject` a `fetchProjectById`. Zavedeno parametrizované sestavování sloupců, které pro nové projekty vytváří prázdný board a pro `project-default` nahrává výchozí karty. Zabezpečeno generování ID s unikátním suffixem.
    *   [`src/components/dashboard/ProjectDashboard.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/dashboard/ProjectDashboard.tsx) – Integrovány ovládací prvky pro mazání projektů (ikona koše u všech kromě `project-default`) a vytvořen elegantní potvrzovací dialog (modal) v designu clearspace.
    *   [`src/components/layout/HeroSection.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/layout/HeroSection.tsx) – Přepsána statická data. Hero panel nově přijímá `totalTasks` a dynamicky přizpůsobuje počitadlo `THIS WEEK` a textaci `FOCUS NOTE` stavu projektu (pro prázdný projekt zobrazuje nulové hodnoty a onboarding text).
    *   [`src/components/board/BoardPanel.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/BoardPanel.tsx) – Změněn nadpis z pevného "Product roadmap" na dynamické vykreslení názvu aktuálního projektu přes prop `projectName`.
    *   [`src/app/projects/[projectId]/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/projects/%5BprojectId%5D/page.tsx) – Načítá detaily projektu a předává dynamická data do HeroSection a BoardPanel.
    *   [`src/app/globals.css`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/globals.css) – Přidána třída `.btn-delete` pro červené mazací tlačítko v modalu.
    *   [`src/__tests__/kanban.test.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/kanban.test.tsx) – Namockována metoda `fetchProjectById` a testy upraveny na `async` čekání na načtení projektu pro odstranění varování `act()`.
    *   [`src/__tests__/kanbanService.test.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/kanbanService.test.ts) – Přidány testovací případy pro `deleteProject` a `fetchProjectById` a opraveno typování pro ESLint.

---

## 2. Implementace a chování

### Jak byly implementovány statistiky
Všechny statistiky (`totalTasks`, `inProgressCount`, `completedCount`, `blockedCount`) jsou počítány dynamicky uvnitř hooku `useKanbanBoard.ts` na základě stavu `columns`. Jelikož jsou sloupce a karty již při načítání filtrovány na úrovni `projectId` (jak v databázi, tak v `localStorage`), jsou veškeré hodnoty automaticky vázané na konkrétní projekt. Pro nový prázdný projekt se naseeduje board s `cards: []`, což automaticky nastaví všechny číselné hodnoty i statistické boxy na `0` a počitadlo `THIS WEEK` na `00`.

### Jak funguje mazání projektu
*   **Klientská interakce:** Uživatel klikne na ikonu koše u projektu (ikona se nezobrazuje u výchozího projektu `project-default`). Tím se otevře potvrzovací modal zobrazující název projektu a varování o nevratnosti smazání.
*   **Servisní vrstva:**
    *   **Lokální režim (offline fallback):** Ze seznamu projektů `kanban_projects` v `localStorage` se vyfiltruje dané ID a záznam desky `kanban_board_${projectId}` se kompletně odstraní z paměti prohlížeče.
    *   **Supabase režim:** Provede se `DELETE` dotaz nad tabulkou `projects`. Vzhledem k cizím klíčům s kaskádovým mazáním (`ON DELETE CASCADE`) na tabulkách `columns` a `cards` se automaticky smažou všechny související sloupce i úkoly v databázi.

### Jak bylo ověřeno, že jsou projekty izolované
Byl vytvořen automatizovaný integrační test `kanbanService.test.ts`, který ověřuje:
1.  Vytvoření dvou odlišných projektů (Projekt A a Projekt B).
2.  Přidání karty do prvního sloupce Projektu A.
3.  Ověření, že se karta správně uložila a zobrazuje v Projektu A.
4.  Ověření, že Projekt B zůstal netknutý a má ve všech sloupcích `cards.length === 0`.
5.  Ověření, že smazání Projektu A nijak neovlivní data Projektu B ani `project-default`.

---

## 3. Status

✅ **Build OK** (Next.js build zkompiloval bez chyb)

✅ **Lint OK** (ESLint prošel s 0 chybami a varováními)

✅ **Tests OK** (Všech 12 testovacích scénářů Vitest prošlo)

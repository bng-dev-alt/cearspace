# Review 03 -- Bugfix & Regression Verification

Tento dokument představuje review (posouzení) a stručný report z opravy regresních chyb v projektu Kanban Board.

---

## 1. Hlášené chyby a jejich příčina

### BUG 1 -- Neaktivní položka navigace "Projekty" na úvodní stránce
*   **Příčina:** Výběr aktivního odkazu v navigaci [`Navbar.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/layout/Navbar.tsx) byl statický. Třída `active` byla natvrdo nastavena na položce "Board", bez ohledu na aktuální adresu (route).
*   **Oprava:** Do komponenty Navbar jsme přidali Next.js hook `usePathname` (převod na klientskou komponentu pomocí `'use client'`). Aktivní stav se nyní vyhodnocuje dynamicky:
    *   Cesty `/` a `/projects` aktivují tab **Projekty**.
    *   Cesta začínající na `/projects/` aktivuje tab **Board**.
    *   Tento systém je konfigurační a snadno škálovatelný pro budoucí sekce (např. `/team`).

### BUG 2 -- Sdílení karet z existující desky při vytvoření nového projektu
*   **Příčiny:**
    1.  Pomocná funkce `getLocalBoard` v [`kanbanService.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/kanbanService.ts) při detekci nového projektu automaticky naklonovala a naseedovala kompletní testovací data z `dummyData.ts` (včetně karet).
    2.  Při vytváření nového projektu v databázi (metoda `createProject` a volání `seedInitialData`) se naseedovaly testovací sloupce včetně všech karet.
    3.  Při rychlém vytváření projektů za sebou docházelo ke kolizi ID projektů generovaných přes `Date.now()`, protože JS provedl příkazy v téže milisekundě.
*   **Oprava:**
    *   Upravili jsme `getLocalBoard` a `seedInitialData` tak, aby se karty nahrávaly **pouze pro výchozí projekt** (`project-default`). Pro jakékoliv jiné/nové ID projektu se vygenerují pouze prázdné výchozí sloupce (Nápady, Naplánováno, V průběhu, K revizi, Hotovo) s `cards: []`.
    *   Upravili jsme `useKanbanBoard` hook, aby se v `getInitialColumns` výchozí karty mapovaly jen pro `project-default`.
    *   Přidali jsme náhodný suffix k ID projektu v `createProject` (`project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`), čímž se zcela eliminovala kolize identifikátorů.

---

## 2. Způsob ověření

1.  **Unit & Service Testy (`src/__tests__/kanbanService.test.ts`):**
    Vytvořili jsme nový samostatný testovací soubor [`src/__tests__/kanbanService.test.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/kanbanService.test.ts) pro službu `kanbanService`, který programově ověřuje:
    *   Zda se výchozí projekt `project-default` korektně načte i se všemi kartami.
    *   Zda se nově vytvořený projekt naseeduje s prázdnými sloupci bez karet.
    *   Zda změny (přidání karty do jednoho projektu) nijak neovlivní ani neznečistí stav ostatních projektů (izolace).
    *   Průběh testů: **Všech 9 testů (5 UI + 4 Service) úspěšně prošlo.**

2.  **Lint & Sestavení:**
    *   `npm run lint` prošel s **0 chybami a varováními**.
    *   `npm run build` úspěšně zkompiloval celou Next.js aplikaci s dynamickými trasami.

---

## 3. Status

✅ **Navbar active states OK**

✅ **Project Board Isolation OK (New projects start empty)**

✅ **Build & Lint OK**

✅ **Vitest Unit Tests OK**

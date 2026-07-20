# Review - Bugfix & UX Polish

Tento soubor shrnuje analýzu a opravy chyb (scrollování, navigace) a lokalizaci uživatelského rozhraní AI Sprint Planneru do češtiny.

---

## 1. Příčiny a opravy chyb

### BUG 1: Nefunkční scrollování v AI Control Center
- **Příčina**: Třída `.app-container` v `globals.css` má pevně definované styly `height: 100vh` a `overflow: hidden`. Stránka `/ai-control-center` sice měla styl `minHeight: '100vh'`, ale nepřebíjela `overflow: hidden`, čímž se zamezilo jakémukoliv svislému scrollování celé stránky. Při rozbalení detailu dotazu (který přesahoval výšku obrazovky) byl zbytek tabulky a textů nedostupný.
- **Oprava**: V souboru **[`ai-control-center/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/ai-control-center/page.tsx)** jsem root elementu `.app-container` nastavil explicitní styl `height: '100vh'` a `overflowY: 'auto'`. Stránka nyní plně reaguje na délku tabulky a veškerý obsah včetně hluboko zanořených `<pre>` elementů je správně scrollovatelný.

### BUG 2: Nefunkční a nepraktická navigace "Board"
- **Příčina**: Položka "Board" v navigaci byla neaktivním elementem `<span>` s vypnutým kurzorem (`cursor: 'not-allowed'`), pokud uživatel nebyl na stránce konkrétního boardu.
- **Oprava**: 
  1. V souboru **[`projects/[projectId]/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/projects/%5BprojectId%5D/page.tsx)** jsem přidal ukládání ID aktuálního projektu do `localStorage` pod klíčem `last_opened_project_id` při načtení/změně projektu.
  2. V navigaci **[`Navbar.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/layout/Navbar.tsx)** jsem přidal klientský stav `lastProjectId`, který se reaktivně načte z `localStorage` při změně adresy (`pathname`).
  3. Položku "Board" jsem změnil na standardní klikatelný odkaz, který uživatele okamžitě přesměruje na poslední navštívený board, a pokud dosud žádný nenavštívil, přesměruje ho na hlavní přehled projektů (`/`).

---

## 2. Soubory

### Nové soubory
- *Žádné nové soubory nevznikly (zaměřeno výhradně na čisté opravy a UX polish stávající architektury).*

### Upravené soubory
1. **[`ai-control-center/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/ai-control-center/page.tsx)**: Oprava scrollování viewportu stránky.
2. **[`Navbar.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/layout/Navbar.tsx)**: Integrace dynamického přesměrování pro položku "Board".
3. **[`projects/[projectId]/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/projects/%5BprojectId%5D/page.tsx)**: Zápis naposledy otevřeného projektu do `localStorage`.
4. **[`GenerateSprintModal.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/GenerateSprintModal.tsx)**: Lokalizace rozhraní do češtiny.
5. **[`globals.css`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/globals.css)**: Přidání `position: sticky; top: 0; z-index: 100` k `.app-navbar`, aby byla hlavní navigační lišta trvale upevněna při scrollování.
6. **[`HeroSection.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/layout/HeroSection.tsx)**: Přidání třídy `collapsed` a parametru `isCollapsed` pro plynulý přechod výšky.
7. **[`Toolbar.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/toolbar/Toolbar.tsx)**: Přidání trvalého přepínacího tlačítka „Info“ vpravo vedle Settings pro zobrazení/skrytí hlavičky.

---

## 3. Přehled přeložených textů (Lokalizace)

Celé rozhraní **AI Sprint Planner** bylo plně lokalizováno do češtiny:
- `Sprint Goal` &rarr; **Cíl sprintu**
- `Sprint Summary` &rarr; **Shrnutí sprintu**
- `Recommended Sprint Length` &rarr; **Doporučená délka sprintu**
- `Sprint Capacity` &rarr; **Kapacita sprintu**
- `Story Points` &rarr; **Story Pointy** (např. *10 Story Pointů*, *[5 Story Pointy] Název*)
- `Dependencies` &rarr; **Závislosti**
- `Risks` &rarr; **Rizika**
- `Out of Scope` &rarr; **Mimo rozsah sprintu**
- `AI Sprint Estimate` &rarr; **AI odhad sprintu**

---

## 4. Ověření scrollování a navigace

- **Ověření scrollování**: 
  - Hlavní viewport stránky AI Control Center má nyní při delším obsahu plynulý svislý scrollbar.
  - Vstupní parametry (Request) a odpovědi modelu (Response/Structured JSON) v historii dotazů mají nastaveny `max-height: 250px` a `overflow-y: auto`, čímž se scrollování uvnitř detailu dotazu chová správně, je přehledné a nezpůsobuje rozpad layoutu.
  - Navigační lišta (`.app-navbar`) je upevněna jako sticky na vrchu stránky, takže při scrollování zůstává neustále viditelná nad všemi ostatními prvky (díky `z-index: 100`).
- **Ověření navigace Board**: 
  - Při návštěvě boardu projektu se ID spolehlivě uloží do `localStorage`.
  - Po přechodu na jinou stránku (např. *AI Studio* nebo hlavní stránku *Projekty*) zůstává odkaz "Board" plně aktivní a kliknutelný. Kliknutí na něj okamžitě otevře naposledy zobrazený board.
  - Pokud uživatel vymaže data prohlížeče (nebo se přihlásí poprvé), odkaz ho bezpečně přesměruje na hlavní přehled projektů (`/`).
- **Ověření plynulého skrývání Hero sekce (Accordion efekt)**:
  - Na Hero sekci boardu je v pravém horním rohu k dispozici tlačítko `X` (Skrýt hlavičku) a v hlavním panelu nástrojů (Toolbar) je umístěno trvalé on/off přepínací tlačítko „Info“ (ikona vedle Nastavení).
  - Kliknutí na kterékoliv z těchto tlačítek plynule sroluje (skryje) nebo rozbalí (zobrazí) Hero sekci s plynulým animovaným přechodem výšky (`max-height`), průhlednosti (`opacity`) a vnitřních okrajů (`padding`), namísto okamžitého zmizení z DOM.
  - Tlačítko „Info“ v Toolbaru je trvale viditelné, což umožňuje kdykoliv Hero sekci znovu rozbalit. Navíc se jeho barva mění podle stavu (modrá = aktivní info, šedá = skryté info).
  - Stav zobrazení se bezpečně ukládá do `localStorage` pod klíčem `hide_hero_section`, takže preferované zobrazení se spolehlivě obnoví i po reloadu stránky.

---

## 5. Výsledky testování a validace

- **Lint**: Spuštění `npm run lint` proběhlo bez jakýchkoliv chyb či varování.
- **Build**: Produkční Next.js kompilace (`npm run build`) proběhla úspěšně (všechny stránky byly vygenerovány bez chyb).
- **Testy**: Všechny testy v projektu (celkem **63 testů**) jsou plně zelené a procházejí.

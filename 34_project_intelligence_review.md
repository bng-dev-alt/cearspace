# Review — Project Intelligence panel + oprava animace draweru

Dvě věci v jednom kroku: (1) oprava chybné otevírací animace task-detail draweru, (2) první reálná verze **Project Intelligence** jako panel, který se animačně chová jako task-detail Drawer.

---

## 1. Bugfix: otevírací animace task-detail draweru

### Co bylo špatně (root cause)
`TaskDetailDrawer` inicializoval mód natvrdo na `'right'` a uloženou preferenci (`task_detail_mode`) načítal až v `useEffect` **po** prvním vykreslení. Panel se proto nejdřív vykreslil jako *Right*, teprve pak `setMode` přepnul na *Left*/*Focused* — a protože `.drawer-content` má `transition` na `left`/`transform`, panel viditelně **přeskočil zprava** na cílovou pozici.

### Oprava (u kořene, bez workaroundu)
Mód se čte z `localStorage` už v **lazy initializeru** `useState`, takže první render má rovnou správnou třídu (`mode-left` / `mode-focused` / `mode-right`) a přehraje se správná vstupní animace. Dodatečný mount-`useEffect` byl odstraněn. Drawer se mountuje čerstvě při každém otevření (`key={selectedCard.id}`), takže lazy init běží jen na klientu — žádné SSR/hydratační riziko.

### Výsledek (ověřeno v prohlížeči)
- **Left**: vyjíždí i zajíždí zleva. Žádný skok zprava.
- **Focused**: vychází i zaniká na středu (zoom + tmavší backdrop).
- **Right**: beze změny.
- Testy `task-detail-modes` (default = right, restore z localStorage) dál procházejí.

---

## 2. Project Intelligence (první verze)

### Koncept → realita
Realizace směru z [33_project_intelligence_concept.md](33_project_intelligence_concept.md): **jeden inteligentní vstupní bod** místo rostoucího seznamu AI tlačítek. Tři samostatná tlačítka (Generate Tasks / AI Sprint Planner / AI Risk Analysis) v toolbaru byla **nahrazena jedním „Project Intelligence"**; jejich funkce žijí uvnitř panelu jako kontextové akce. (Reverzibilní — modaly zůstaly, jen se otevírají z panelu.)

### Animace = task-detail Drawer
Panel znovupoužívá třídy `.drawer-overlay` + `.drawer-content.mode-right` a stejný `isClosing`/`requestClose` pattern (exit animace před odmountováním, zavření přes `Esc` i klik na overlay). Vysouvá se zprava přesně jako task-detail drawer.

### Deterministický „mozek" (klíčové rozhodnutí)
Nová čistá funkce `lib/projectIntelligence.ts` počítá **všechny** poznatky jen z reálných dat boardu — žádné LLM, žádná halucinace, žádná vymyšlená pole (např. „story points" v modelu nejsou, tak o nich netvrdíme nic). AI vrstva by fakta jen přeformulovala, sama je nevymýšlí. Funkce je čistá a **pokrytá unit testy**.

Počítá:
- **Zdraví**: stavové slovo (V pořádku / Vyžaduje pozornost / V ohrožení) + jednořádkové proč + **odvozené a vysvětlitelné skóre** (breakdown „z čeho se počítá": Blokátory −8/ks, Po termínu −6/ks, Fronta k revizi, Nepřiřazené). **Tvrdé pravidlo:** s otevřeným danger signálem (blokátor / po termínu) NEMŮŽE být „V pořádku" — jinak by panel tvrdil „V pořádku" a hned pod tím ukazoval červené blokátory (rozpor = ztráta důvěry). *Tuto past odhalilo až vizuální ověření a byla opravena.*
- **Insights**: blokované úkoly, po termínu, fronta k revizi, bez řešitele, bez termínu, chybí priorita „Vysoká", prázdný backlog, prázdný projekt. Každý má **tvrdý fakt** (v UI mono font) + lidskou formulaci důsledku, řazené danger → warning → neutral.
- **Akce jako důsledek stavu**, řazené dle relevance: Projít blokátory (jen když jsou blokátory) → Naplánovat sprint → Vygenerovat úkoly. Napojené na stávající `/api/ai/*` modaly.

### UX detaily
- Hlavička je **klidná deklarace** („Přehled projektu … · aktualizováno teď") — žádná persona, žádné „Dobré ráno 👋".
- Insighty nesou štítek `vypočteno z boardu`, akce `řazeno dle relevance`.
- „Zeptej se AI" je záměrně dole a označené `brzy` (poctivě — chat ještě není).
- Akce nejdřív plynule zavře panel, teprve pak otevře příslušný modal (overlaye se nepřekrývají).

---

## Nové soubory
- `lib/projectIntelligence.ts` — deterministický výpočet zdraví / insightů / akcí (čistá funkce).
- `components/board/ProjectIntelligenceDrawer.tsx` — panel (reuse drawer animace).
- `__tests__/projectIntelligence.test.ts` — 4 testy (prázdný projekt, blokátor, po termínu s injektovaným časem, zdravý projekt).

## Upravené soubory
- `components/board/TaskDetailDrawer.tsx` — lazy init módu (bugfix), odstraněn mount-effect.
- `components/toolbar/Toolbar.tsx` — 3 AI tlačítka → 1 „Project Intelligence" (`onOpenIntelligence`).
- `app/projects/[projectId]/page.tsx` — stav + render panelu (dynamic import), přepojen toolbar.
- `app/globals.css` — `.pi-*` styly panelu (tokenizované, light i dark).

---

## Ověření (demo režim, prohlížeč)
- Toolbar má jedno teal tlačítko „Project Intelligence"; tři AI tlačítka pryč.
- Panel se vysouvá zprava (drawer animace), Esc / klik na overlay zavírá plynule.
- Insighty reálné z boardu: „1 blokovaný úkol", „2 úkoly po termínu". Zdraví po opravě: **Vyžaduje pozornost** (ne „V pořádku").
- Akce „Projít blokátory" / „Naplánovat sprint" otevírají příslušné AI modaly.
- Task-detail Left/Focused ověřeny (viz výše).

## Výsledky
- `npm run lint`: **0 chyb, 0 varování.**
- `npx vitest run`: **96/96** (18 souborů; +4 nové).
- `npm run build`: **úspěšný** (TypeScript OK, 15 stránek).

## Doladění po zpětné vazbě
- **Pozicovací bar** (Left / Focused / Right + Fullscreen placeholder) přidán do hlavičky panelu — stejný systém i animace jako task detail, vlastní preference (`project_intelligence_mode`), lazy init (žádný skok). Ověřeno: Focused vycentruje, Left/Right přepínají stranu.
- **Vizuální váha**: panel působil „nevýrazně" oproti task detailu. Zvětšen status (1.25rem), skóre (tučné), fakty insightů (0.92rem mono), názvy akcí (0.92rem), ikony, rozestupy a section labels. Teď má srovnatelnou přítomnost jako task-detail karta.
- **„Zeptej se AI" je nyní reálné** (ne placeholder „brzy"). Napojeno na existující `/api/ai/chat` s **kontextem boardu** (`context: { columns }`) → odpovědi jsou konkrétní k projektu (ověřeno: AI odkazuje na reálné karty a řešitele). Konverzace v bublinách (user teal vpravo, AI vlevo), stav loading „Přemýšlím…", chybová hláška, auto-scroll dolů. Bez emoji (system prompt to hlídá). *Bylo zbytečně opatrné to dělat jako placeholder — endpoint už existoval.*

## Mimo tento krok (další iterace)
- Ambientní verze (pulse chip + „chytré" stat dlaždice) z pětice návrhů.
- Reálný „Ask AI" chat s kontextem projektu.
- Signature akce: Najít závislosti, Generovat dokumentaci.
- Klávesová zkratka `⌘ I` pro otevření panelu.
- Health-skóre s rozklikatelným breakdownem přímo v UI (data už funkce vrací).

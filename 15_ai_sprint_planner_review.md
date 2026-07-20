# Review - AI Sprint Planner Modul

Modul **AI Sprint Planner** byl plně naimplementován, otestován a integrován jako nová inteligentní AI funkce do stávajícího řešení Kanban boardu.

---

## 1. Soubory

### Nové soubory
1. **[`GenerateSprintModal.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/GenerateSprintModal.tsx)**: UI komponenta pro konfiguraci, zobrazení náhledu návrhu sprintu (sprint goal, story points, důvody výběru, out-of-scope položky atd.) a vytvoření nového sprint boardu.
2. **[`route.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/api/ai/generate-sprint/route.ts)**: API endpoint `/api/ai/generate-sprint` pro komunikaci s LLM vrstvou a validaci strukturovaného JSON výstupu.
3. **[`generate-sprint.test.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/generate-sprint.test.tsx)**: Integrační testovací sada ověřující validaci vstupů na endpointu a správné parsování JSON odpovědí z Gemini API.

### Upravené soubory
1. **[`schemas.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/schemas.ts)**: Přidáno `sprintPlanningSchema` definující přísná pravidla a datové typy pro strukturovaný výstup z Gemini.
2. **[`promptBuilder.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/promptBuilder.ts)**: Upraven systémový prompt `buildSprintPlanningPrompt` tak, aby model vystupoval jako zkušený Product Owner a vracel validní JSON data v češtině.
3. **[`aiService.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/aiService.ts)**: Metoda `executeSprintPlanning` byla upravena na předávání `sprintPlanningSchema` a zvýšení limitu na `maxTokens: 4000`.
4. **[`Toolbar.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/toolbar/Toolbar.tsx)**: Přidáno tlačítko **AI Sprint Planner** s modrou barvou primary (#209dd7) k vizuálnímu odlišení.
5. **[`page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/projects/%5BprojectId%5D/page.tsx)**: Zaveden stav pro ovládání modalu a rendering komponenty `GenerateSprintModal`.

---

## 2. Architektura Sprint Planneru

Integrace staví na stávající robustní AI architektuře a probíhá bez zásahu do jiných AI modulů:

```
[Toolbar: AI Sprint Planner] 
           | (Otevře modal)
           v
[GenerateSprintModal (Krok 1: Výběr SP & týdnů)]
           | (Volá API endpoint se seznamem úkolů)
           v
[POST /api/ai/generate-sprint] 
           | (Validuje vstup, sestavuje prompt)
           v
[aiService.executeSprintPlanning (Gemini 3.5 Flash)] 
           | (Vrací strukturovaný JSON dle schema)
           v
[GenerateSprintModal (Krok 2: Preview)]
           | (Uživatel potvrdí vytvoření)
           v
[Vytvoření nového projektu (Sprint Boardu) a nakopírování vybraných úkolů]
```

- **Perzistence a izolace**: Návrh sprintu neovlivňuje a nepřepisuje původní backlog. Po schválení se volá `kanbanService.createProject`, který vytvoří zcela nový projekt (board) s názvem obsahujícím cíl sprintu (např. *Sprint: Vyvinout základní e-shop*). Vybrané úkoly se zkopírují do prvního sloupce nového boardu.
- **Viditelnost parametrů**: Story Points a zdůvodnění výběru úkolu jsou zapsány přímo do názvu a popisu kopírovaných karet (např. title: `[5 SP] Název úkolu`), což zajišťuje okamžitou viditelnost v Kanban rozhraní bez nutnosti měnit DB schéma.

---

## 3. Prompt & JSON struktura

### Prompt (Systémová pravidla)
Model je instruován takto:
- Jednat jako zkušený Scrum Master a Product Owner.
- Vybrat logickou skupinu úkolů, které tvoří jednotný cíl (Sprint Goal).
- Ohodnotit úkoly pomocí Fibonacciho řady (1, 2, 3, 5, 8, 13) na základě složitosti.
- Odhadnout dobu trvání.
- Respektovat kapacitu a prioritu úkolů.
- Definovat závislosti, procesní/technická rizika a důvody pro odložení ostatních úkolů (Out of Scope).

### JSON Schema
Výstup z Gemini API přesně odpovídá následující struktuře:
```json
{
  "sprintGoal": "Hlavní cíl sprintu",
  "sprintSummary": "Odůvodnění a shrnutí sprintu",
  "recommendedSprintLength": "např. 2 týdny",
  "sprintCapacity": "např. 20 SP",
  "selectedTasks": [
    {
      "id": "původní-id-ukolu",
      "title": "Název úkolu",
      "priority": "High / Medium / Low",
      "storyPoints": 5,
      "estimatedTime": "např. 2d",
      "reason": "Zdůvodnění zařazení"
    }
  ],
  "dependencies": ["Popis závislostí"],
  "risks": ["Popis rizik"],
  "outOfScope": [
    {
      "id": "původní-id-ukolu",
      "title": "Název úkolu",
      "reason": "Důvod odložení"
    }
  ]
}
```

---

## 4. UI/UX Rozhodnutí

- **Prémiové barevné odlišení**: Tlačítko pro spuštění v hlavní liště používá barvu `Blue Primary (#209dd7)`, která doplňuje fialové tlačítko "Generate Tasks".
- **Dvoukrokový workflow**: Uživatel nejprve zvolí délku sprintu a požadovanou kapacitu, což slouží jako vstupní parametry pro AI.
- **Interaktivní dashboard**: Náhled návrhu je strukturovaný tak, aby simuloval agilní plánovací schůzku. Cíl sprintu a parametry jsou zvýrazněné nahoře, úkoly jsou seřazené pod sebou s barevnými odznaky priorit a SP, a rizika jsou červeně zvýrazněna.
- **Přesměrování**: Po stisknutí "Vytvořit Sprint Board" je uživatel plynule přesměrován na nový board a může okamžitě začít pracovat.

---

## 5. Testování & Kontrola kvality

1. **Unit/Integrační testy**: Napsal jsem testy v `generate-sprint.test.tsx`, které simulují jak chybný vstup (prázdný backlog), tak úspěšnou generaci a parsování dat.
2. **Vitest**: Všech **63 testů** v projektu úspěšně prochází bez jakýchkoliv chyb.
3. **Linter**: Spuštění `npm run lint` skončilo s nulovým počtem chyb či varování.
4. **Build**: Příkaz `npm run build` sestavil celou Next.js aplikaci úspěšně za použití Turbopacku.

---

## 6. Doporučení pro další rozvoj

1. **Aktualizace stavu původního backlogu**: Při vytvoření sprintu by bylo užitečné automaticky označit vybrané úkoly v původním backlogu štítkem (např. *In Sprint 1*), nebo je přesunout do sloupce s probíhajícím vývojem, případně je archivovat, aby se zamezilo jejich duplicitnímu plánování v příštím sprintu.
2. **Uložení rizik do poznámek boardu**: Můžeme přidat možnost automatického vytvoření speciální informační karty (např. *Informace o sprintu*) v prvním sloupci nového boardu, která by v popisu obsahovala seznam identifikovaných rizik a závislostí pro snadný přístup celého týmu.

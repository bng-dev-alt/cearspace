# Review 09 -- AI Improve Task Review

Tento dokument shrnuje zavedení první skutečné AI funkce v aplikaci: **✨ AI Improve Task**. Funkce pomáhá uživateli analyzovat stávající úkol, navrhnout jeho vylepšení na základě celkového kontextu projektu a zapsat tyto změny teprve po schválení uživatelem (Preview & Accept/Discard workflow).

---

## 1. Dotčené soubory

### Nové soubory
- [`frontend/src/app/api/ai/improve/route.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/api/ai/improve/route.ts) — Serverová API cesta `/api/ai/improve` pro vykonání vylepšovacího dotazu na OpenRouter a bezpečné parsování/očištění JSON odpovědi.

### Upravené soubory
- [`frontend/src/services/ai/promptBuilder.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/promptBuilder.ts) — Refaktoring metody `buildTaskImprovePrompt` pro generování strukturovaného JSON výstupu s konkrétními instrukcemi (Piš česky, Buď stručný, Nevymýšlej si fakta, Zachovej původní význam).
- [`frontend/src/components/board/TaskDetailDrawer.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/TaskDetailDrawer.tsx) — Integrace nového UI v AI sekci draweru (tlačítko, loading, zobrazení chyb, strukturované preview a tlačítka Accept / Discard). Přidání stavů a odesílání událostí do aktivity úkolu.
- [`frontend/src/app/projects/[projectId]/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/projects/%5BprojectId%5D/page.tsx) — Propojení metody `addActivity` z hooku `useKanbanBoard` s drawerem.
- [`frontend/src/app/globals.css`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/globals.css) — Přidány CSS styly a klíčové snímky pro animaci AI spinneru (`.ai-spinner`).
- [`frontend/src/__tests__/ai.test.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/ai.test.ts) — Přidány unit testy pro API endpoint `/api/ai/improve` a ošetření nevalidních vstupů či chybného parsování JSONu.
- [`frontend/src/__tests__/drawer.test.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/drawer.test.tsx) — Přidány integrační testy pro UI v draweru (ověření zobrazení Improve tlačítka, loading stavu, preview panelu a správné reakce při stisku Accept a Discard).

---

## 2. Architektura & AI Workflow

### Kontext (Context)
Při požadavku na vylepšení se odesílá kompletní kontext úkolu i projektu:
- Název a popis karty
- Priorita, termín a řešitel
- Všechny položky checklistu
- Všechny komentáře k úkolu
- Historie aktivity úkolu
- Rozložení sloupců na boardu a názvy ostatních úkolů pro širší agilní kontext

### Prompt a JSON struktura
Systémový prompt v `promptBuilder.ts` striktně vyžaduje návrat strukturovaného JSONu s klíči:
- **`details`**: Srozumitelnější a jasnější verze popisu úkolu.
- **`acceptanceCriteria`**: Akceptační kritéria úkolu (bodově 1., 2. ...).
- **`risks`**: Technická rizika a omezení související s implementací.
- **`missingInfo`**: Dotazy na chybějící detaily, které by měl zadavatel doplnit.
- **`checklist`**: Pole doporučených položek checklistu typu `string[]`.

### Preview & User Control
Výsledky se na kartě neuloží ihned. 
- V draweru se zobrazí strukturovaný náhled (Preview) s jednotlivými sekcemi.
- **Accept**: Zapíše změny. Změní popis karty (k popisu se připojí akceptační kritéria, rizika a chybějící info) a postupně přidá navržené položky checklistu přes callback `onAddChecklistItem`. Zapíše do historie aktivity úkolu `Accepted AI suggestion`.
- **Discard**: Zahodí vygenerovaný návrh bez jakýchkoliv změn na kartě. Zapíše do historie aktivity úkolu `Discarded AI suggestion`.

---

## 3. Zpracování chyb (Error Handling) & Loading

- **Loading**: Během čekání na odpověď se zobrazí animovaný spinner a text `✨ AI právě analyzuje úkol...`. Tlačítko pro odeslání je skryté, čímž se předchází vícenásobným kliknutím.
- **Ošetření chyb**: Serverový API endpoint čistí případné zbytečné znaky (např. markdown značky ```json), čímž předchází chybám při parsování. V případě síťové chyby, vypršení limitu nebo chybného API klíče se v UI zobrazí jasné chybové hlášení s možností akci zopakovat.

---

## 5. Oprava chyb (Bugfix)

### Odstranění pádu `Cannot read properties of undefined (reading 'forEach')`
- **Příčina**: Původní kód předával z `page.tsx` do `TaskDetailDrawer` ořezané pole sloupců `{ id, name }[]`. Serverový Prompt Builder však na sloupci (`col`) vyžadoval pole `cards` (`col.cards.forEach`), které bylo v ořezaném objektu `undefined`. To způsobilo pád s výše uvedenou výjimkou.
- **Řešení**:
  1. Změnili jsme typ parametru `columns` v rozhraní `TaskDetailDrawerProps` z ořezaného `{ id: string; name: string }[]` na plný `Column[]` typ.
  2. V `page.tsx` nyní předáváme kompletní `columns` (včetně karet), což navíc umožňuje AI asistentovi analyzovat celý stav boardu pro přesnější kontext.
  3. V souboru [`promptBuilder.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/promptBuilder.ts) jsme přidali robustní kontrolu `if (col.cards && col.cards.length > 0)`, čímž jsme vyloučili riziko pádu i v případě, že by pole karet nebylo definováno.
  4. Aktualizovali jsme testy v [`drawer.test.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/drawer.test.tsx), aby vyhovovaly novému typovému omezení.

### Optimalizace bezplatného modelu (odstranění chyb 404)
- **Problém**: Vybraný model `google/gemma-2-9b-it:free` vracel na straně OpenRouteru chybu 404 (`No endpoints found`).
- **Řešení**: Změnili jsme výchozí bezplatný model na dynamický router **`openrouter/free`** v `.env.local` i `.env.example`. Tento router automaticky vyhledá a použije jakýkoliv aktuálně dostupný a online bezplatný model na OpenRouteru, čímž zajišťuje maximální dlouhodobou stabilitu bez nutnosti ručních úprav kódu.

---

## 6. Doporučení pro další AI milestone

1. **AI Task Generation / AI Split Task**:
   Umožnit uživateli přímo na boardu nebo v draweru nechat AI rozdělit jeden velký úkol na subtasky (které se vytvoří jako samostatné karty), případně vygenerovat novou kartu z textového zadání.
2. **AI Chat v Draweru**:
   Zprovoznit interaktivní chatovací box, kde se uživatel může doptávat na detaily úkolu s plným zachováním kontextu boardu.

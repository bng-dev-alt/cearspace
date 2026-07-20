# Review - AI Risk Analysis

Tento soubor shrnuje kompletní přehled implementace nové funkce **AI Risk Analysis**.

---

## 1. Nové soubory
1. **[`route.ts` (API endpoint)](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/api/ai/risk-analysis/route.ts)**: Endpoint `/api/ai/risk-analysis` pro volání Gemini API a zpracování strukturované odpovědi.
2. **[`RiskAnalysisModal.tsx` (UI komponenta)](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/RiskAnalysisModal.tsx)**: Moderní přehledový dashboard zobrazující detailní analýzu rizik celého projektu.
3. **[`risk-analysis.test.tsx` (Testovací sada)](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/risk-analysis.test.tsx)**: Unit a integrační testy pro API endpoint.

---

## 2. Upravené soubory
1. **[`schemas.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/schemas.ts)**: Přidáno definiční schéma `projectRiskAnalysisSchema` vynucující Structured Output z Gemini API.
2. **[`promptBuilder.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/promptBuilder.ts)**: Přidána metoda `buildRiskAnalysisPrompt` pro sestavení kontextu projektu (backlogu, workflow, priorit) a pokynů pro model.
3. **[`aiService.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/aiService.ts)**: Přidána backendová metoda `executeRiskAnalysis` pro vykonání analýzy přes Gemini provider.
4. **[`Toolbar.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/toolbar/Toolbar.tsx)**: Přidáno prémiové žluté akční tlačítko **AI Risk Analysis** (`#ecad0a`) s ikonou `ShieldAlert`.
5. **[`page.tsx` (projekty)](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/projects/%5BprojectId%5D/page.tsx)**: Integrovány stavy a renderování modálního okna.

---

## 3. Architektura AI Risk Analysis
- **Modularita**: Funkce plně zapadá do stávající orchestrace AI v projektu.
- **Provider**: Využívá existující instanci `providerFactory` a `geminiProvider` pro komunikaci s modelem `gemini-3.5-flash`.
- **Structured Output**: Na úrovni API je předáno přesné JSON schéma, čímž odpadá nestabilní parsování textového výstupu a je zaručen validní formát.
- **AI Control Center**: Každé volání se automaticky loguje přes middleware/layer a je dohledatelné v AI observability Control Centeru.

---

## 4. Prompt
Systémový prompt definuje roli zkušeného Tech Leada, Softwarového Architekta a Product Managera:
```typescript
Jsi zkušený Tech Lead, Software Architect a Product Manager s dlouholetou praxí v řízení rizik u softwarových projektů.
Tvým úkolem je kriticky zanalyzovat celý projekt (jeho workflow, backlog úkolů, priority, popisy, řešitele a termíny) a upozornit uživatele na slabá místa, chybějící části, bottlenecks, technický dluh, bezpečnostní a výkonnostní rizika a doporučení pro MVP.
...
Komunikuj výhradně ČESKY, věcně, kriticky, konstruktivně a profesionálně. Nepoužívej emoji.
```
Uživatelský prompt předává detailní strukturu sloupců a všech aktivních úkolů (včetně názvu, popisu, priorit, řešitelů, termínů, checklistů a komentářů).

---

## 5. JSON struktura
```json
{
  "executiveSummary": "Manažerské shrnutí rizik celého projektu...",
  "overallRiskScore": 45,
  "biggestRisks": [
    {
      "name": "Název rizika",
      "severity": "Low" | "Medium" | "High",
      "explanation": "Vysvětlení rizika...",
      "recommendation": "Doporučené řešení..."
    }
  ],
  "bottlenecks": ["Seznam úzkých hrdel"],
  "missingFeatures": ["Chybějící klíčové části"],
  "technicalDebt": ["Technický dluh"],
  "securityRisks": ["Bezpečnostní hrozby"],
  "performanceRisks": ["Výkonnostní slabiny"],
  "mvpRecommendations": ["MVP doporučení"],
  "topAiRecommendations": ["Top 5 doporučení (přesně 5 bodů)"]
}
```

---

## 6. UI rozhodnutí
- **Accent Yellow**: Tlačítko akce v Toolbaru je barevně nastaveno na žlutou `#ecad0a` (podle barevného schématu projektu) pro rychlé vizuální rozpoznání souvislosti s analýzou rizik.
- **Risk Score Indicator**: Zobrazeno jako výrazný centrální kruhový indikátor v horním řádku. Barva se dynamicky mění podle závažnosti skóre (zelená pro nízké, oranžová pro střední, červená pro vysoké riziko).
- **Strukturovaný grid**: Jednotlivé kategorie rizik (dluh, bezpečnost, MVP atd.) jsou zobrazeny v přehledné mřížce karet, aby se uživatel v datech snadno orientoval.
- **Top 5 AI Recommendations**: Na závěr analýzy je zobrazen speciální box se žlutým ohraničením obsahující právě 5 nejdůležitějších, akčních doporučení od AI.

---

## 7. Testování
- **Automatizované testy**:
  - V souboru `src/__tests__/risk-analysis.test.tsx` jsou implementovány testy pro ověření API endpointu, správnosti parametrů, chybových stavů (např. chybějící název projektu) a validního parsování JSON.
  - Všechny testy v projektu (celkem 65 testů) jsou plně zelené a procházejí.
- **Manuální testování**:
  - Ověřen loading stav (rotující žlutý spinner se zpřesňující zprávou).
  - Ověřeno zobrazení výsledného preview panelu i zavření modálního okna.

---

## 8. Doporučení pro další rozvoj
1. **Interaktivní mitigace**: U každého rizika přidat tlačítko „Vyřešit pomocí AI“, které by automaticky vygenerovalo odpovídající úkol do backlogu k nápravě tohoto rizika.
2. **Historie rizik**: Ukládat skóre rizik v čase a zobrazovat v AI Control Center graf vývoje celkového technického dluhu a rizik projektu.

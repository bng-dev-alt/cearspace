# Review 08 -- AI Foundation Review

Tento dokument shrnuje zavedení robustní, bezpečné a rozšiřitelné AI infrastruktury (AI Foundation) pro projektový Kanban board. Architektura je navržena podle zásad Clean Architecture, SOLID a Next.js/TypeScript osvědčených postupů tak, aby byla plně připravena pro budoucí implementaci konkrétních AI funkcí.

---

## 1. Dotčené soubory

### Nové soubory
- [`frontend/src/services/ai/types.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/types.ts) — Rozhraní a typové definice pro požadavky, odpovědi, konfiguraci modelů a kontext AI.
- [`frontend/src/services/ai/promptBuilder.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/promptBuilder.ts) — Centrální Prompt Builder pro tvorbu a formátování promtů a serializaci detailů karet/projektu.
- [`frontend/src/services/ai/openRouterProvider.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/openRouterProvider.ts) — Provider vrstva starající se o přímou komunikaci s API OpenRouter, chybové stavy a timeouty.
- [`frontend/src/services/ai/aiService.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/aiService.ts) — Business logic vrstva, která koordinuje tvorbu promptů a logování a spouští dotazy.
- [`frontend/src/app/api/ai/chat/route.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/api/ai/chat/route.ts) — Next.js serverový endpoint `/api/ai/chat` pro bezpečné zpracování dotazů bez odhalení API klíče klientovi.
- [`frontend/src/__tests__/ai.test.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/ai.test.ts) — Integrační a unit testy ověřující správnost sestavení promptů, chybové statusy a zpracování odpovědí.

### Upravené soubory
- [`frontend/.env.example`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/.env.example) — Přidány šablony proměnných pro OpenRouter.
- [`frontend/.env.local`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/.env.local) — Lokální konfigurační soubor s nastavením API klíče a modelu.

---

## 2. Detaily AI architektury

```
  React UI (Drawer / AI Assistant)
                │
                ▼ (POST request)
       Next.js API Route (/api/ai/chat)
                │
                ▼ (Business Logic)
            aiService.ts (Loguje dotazy, formátuje typy)
           /            \
          /              \
         ▼                ▼
   promptBuilder.ts    openRouterProvider.ts (Fetch API)
(Sestavuje prompty)       │
                          ▼ (Network Call)
                      OpenRouter API
```

### Provider Layer (openRouterProvider.ts)
Zodpovídá výhradně za sestavení HTTP požadavku na OpenRouter a bezpečné doručení odpovědi.
- Obsahuje nastavení timeoutu (30 sekund) přes `AbortController`.
- Zpracovává specifické HTTP status kódy a převádí je na systematické výjimky (`OPENROUTER_RATE_LIMIT`, `OPENROUTER_INVALID_API_KEY` atd.).
- API klíč se používá výhradně na serverové straně.

### Business Logic (aiService.ts)
Koordinuje proces zpracování AI akcí. Zahrnuje:
- Volání Prompt Builderu pro sestavení systémové role a uživatelského zadání.
- Předání parametrů (temperature, maxTokens, model) do Providera.
- Převod chybových stavů na přívětivé texty v češtině.
- Serverové logování každého požadavku (čas, model, doba zpracování, tokeny, stav).

### Prompt Builder (promptBuilder.ts)
Konstruuje instrukce pro model a formátuje kontext. Je to jediné místo, kde se definují šablony zpráv a system prompts.
- **`formatCardContext`**: Převádí kompletní stav karty (název, popis, checklisty, komentáře a historii aktivity) do čitelného textu.
- **`formatProjectContext`**: Převádí strukturu sloupců boardu a názvy ostatních karet projektu do čitelného textu.
- Obsahuje předpřipravené šablony pro budoucí funkce (Chat, Task Improvement, Task Splitting, Sprint Planning atd.).

### API Route (/api/ai/chat)
Bezpečný serverový endpoint Next.js.
- Provádí základní validaci vstupů (ověření pole `messages`).
- Zachycuje výjimky z `aiService` a vrací odpovídající HTTP status kódy (401 pro špatný klíč, 429 pro překročený limit, 504 pro timeout).

---

## 3. Zpracování chyb & Logování

- **Chyby**: Implementovány uživatelsky čitelné chybové hlášky pro typické stavy (vypršení časového limitu, nedostupnost sítě, neplatný API klíč, překročení limitů).
- **Logování**: Na serverové straně se zapisuje standardní log ve formátu:
  `[AI SERVICE LOG] {Timestamp} | Action: {action} | Model: {model} | Duration: {duration}ms | Success: {success}`

---

## 4. Připravenost na budoucí AI funkce & Změna modelů

### Jak jednoduše změnit model (Claude / GPT / Gemini / Free modely)
Změnu lze provést dvěma způsoby:
1. **Globálně**: V souboru `.env.local` změnit hodnotu `OPENROUTER_MODEL` na libovolný model podporovaný OpenRouterem.
   - **Placené modely**: `anthropic/claude-3.5-sonnet` (velmi inteligentní, ale dražší na tokeny), `openai/gpt-4o`.
   - **Bezplatné modely (Free)**: `google/gemma-2-9b-it:free` nebo `meta-llama/llama-3-8b-instruct:free` (jsou 100% zdarma, velmi rychlé a výborně rozumí i odpovídají v češtině).
2. **Lokálně**: Při volání `executeChat` předat v konfiguraci `config.model` konkrétní název modelu.

### Připravenost na budoucí funkce
V `promptBuilder.ts` a `aiService.ts` jsou již předpřipravené a plně typově popsané metody pro všechny plánované operace:
- Tvorba nových úkolů (`executeTaskGenerate`)
- Vylepšení zadání úkolu (`executeTaskImprove`)
- Rozdělení úkolu na subtasky (`executeTaskSplit`)
- Plánování agilních sprintů (`executeSprintPlanning`)
- Sémantické vyhledávání (`executeSearch`)
- Vytvoření bodového shrnutí úkolu (`executeSummary`)

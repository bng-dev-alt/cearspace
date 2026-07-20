# Review — AI odolnost proti timeoutu (Sprint Planner)

Uživatel dostal na AI Sprint Planneru „Požadavek na Gemini vypršel (timeout)". Sprint planning je nejtěžší strukturovaná generace (JSON schema, 4000 tokenů), a timeout byl natvrdo 35 s pro všechna volání.

## Co bylo špatně
- **Jeden hardcoded 35s timeout** pro všechny AI operace ([geminiProvider.ts](frontend/src/services/ai/geminiProvider.ts)). Nejtěžší generace (sprint, projekt) do něj občas nestihnou.
- **Žádný retry** — přechodný výpadek/timeout hned padl na uživatele.

## Oprava (u kořene)
1. **Per-request timeout** — `AiModelConfig.timeoutMs`; default zvednut na **45 s**, Sprint Planner má **55 s**.
2. **Jeden automatický retry** na přechodný timeout — pokrývá interní pojistku i API deadline (`GEMINI_TIMEOUT` / `DEADLINE_EXCEEDED` / `504`). Přechodné výpadky se zhojí samy dřív, než chybu vidí uživatel.
3. Čerstvý timer na každý pokus + `clearTimeout` (žádné visící timery).
4. `thinkingBudget: 0` zůstává (thinking vypnutý = rychlejší).

## Upravené soubory
- `services/ai/types.ts` — `timeoutMs?` na `AiModelConfig`.
- `services/ai/geminiProvider.ts` — per-request timeout, `attempt()` helper, retry na přechodný timeout.
- `services/ai/aiService.ts` — Sprint Planner `timeoutMs: 55000`.
- `__tests__/ai.test.ts` — +2 testy retry (úspěch po retry; vzdá to po jednom retry → `GEMINI_TIMEOUT`).

## Výsledky
- `npm run lint`: **0/0**
- `npx vitest run`: **98/98** (+2)
- `npm run build`: **úspěšný**

## Pozn.
Klientský fetch nemá vlastní timeout (čeká), takže 55 s + případný retry se v pohodě stihne. Chybová hláška i ruční „Navrhnout Sprint" pro opakování zůstávají.

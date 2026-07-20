# Review — AI overload (503) + dark-mode fixy

Dvě chyby nahlášené na živé appce.

## 1. AI chyba: 503 „high demand / UNAVAILABLE"
Gemini při přetížení vrací 503/UNAVAILABLE. To propadalo na `throw GEMINI_ERROR: {raw json}` → uživatel viděl ošklivý JSON a nebyl žádný retry.

**Oprava:**
- **Auto-retry** i na přetížení (503/UNAVAILABLE/overloaded/high demand) — přidáno do přechodných chyb (vedle timeoutu). Přetížení bývá krátkodobé, jeden retry ho často vyřeší.
- **Mapování** na `GEMINI_OVERLOADED` + **čitelná česká hláška**: „Model Gemini je momentálně přetížený (vysoká poptávka). Zkuste to prosím za chvíli znovu." Místo raw JSON.
- Testy: +2 (retry na 503 → úspěch; opakované 503 → `GEMINI_OVERLOADED`) + friendly-error assert.

## 2. Dark mode: bílá tlačítka/pilulky
V AI Project Studiu (a task-detail switcheru) byla natvrdo `#ffffff` pozadí → v dark mode bílé plochy, u switcheru dokonce **bílé pozadí + světlý text = neviditelné**.

**Oprava (tokenizace):**
- `GenerateProjectModal` — typ projektu, stack pilulky, úroveň detailu, počet úkolů, výsledkové karty: nevybrané `#ffffff` → `var(--surface)`, vybrané tinty → `var(--accent-soft)`.
- `TaskDetailDrawer` mode-switcher (Left/Focused/Right) — aktivní `#ffffff` → `var(--surface)` (opraven neviditelný text v dark mode).
- Ověřeno v prohlížeči (dark mode): tlačítka i pilulky tmavé, text čitelný.

## Upravené soubory
- `services/ai/geminiProvider.ts` — retry i na overload, mapování `GEMINI_OVERLOADED`.
- `services/ai/aiService.ts` — friendly hláška.
- `components/board/GenerateProjectModal.tsx` — tokenizace 5 pozadí.
- `components/board/TaskDetailDrawer.tsx` — tokenizace switcheru.
- `__tests__/ai.test.ts` — +2 testy + assert.

## Výsledky
- `npm run lint`: **0/0**
- `npx vitest run`: **100/100** (+2)
- `npm run build`: **úspěšný**

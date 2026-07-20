# Design Bible — Fáze 4: Projekty + Kalendář

Sladění projektové portálové stránky a kalendáře do premium glass jazyka boardu. **Workflow a funkce beze změny** (navigace na projekt, mazání, generování, přepínač Board/Kalendář, klik na event → drawer).

## Projekty (portál `ProjectDashboard`)

Portál byl inline-styled se **starými modrými/fialovými** akcenty (relikt před emeraldem). Sjednoceno:
- **New Project karta:** ikona z modrého kruhu (`rgba(32,157,215,…)`) → **emerald** (`--accent-soft` + `--accent`), radius `12px` → `var(--radius-card)` (18).
- **Generate Project (AI Engine) karta:** fialovo-modrý gradient + fialový border/ikona → **emerald** (`--accent-soft` pozadí, `--accent-ring` border, emerald ikona/titulek, emerald hover + `--shadow-md`). Radius 18. Zůstává jako zvýrazněná AI karta, ale v emeraldu.
- **Projektové karty:** inline `borderRadius: 10px` (přebíjel `.card`) → `var(--radius-card)` (18) — konzistentní s boardem.
- **Empty state** ("Žádné projekty") → adopce **`EmptyState` primitivu** z Fáze 1 (serif titulek, emerald vizuál).

## Kalendář

Kalendář byl už dobře tokenizovaný (emerald today-highlight, emerald hover na nav/today tlačítkách a event chipech, glass). V této fázi:
- `.calendar-panel` radius `12px` → `var(--radius-card)` (sladění se zbytkem).
- Ověřeno, že today číslo, nav tlačítka i event chipy nesou emerald a glass z Fáze 0.

## Změněné soubory
- `src/components/dashboard/ProjectDashboard.tsx` — emerald New/Generate karty, radius, adopce `EmptyState`, radius projektových karet.
- `src/app/globals.css` — `.calendar-panel` radius.

## Důležitá rozhodnutí
- **EmptyState primitiv nasazen** na prázdný stav projektů (první reálná adopce z Fáze 1 mimo pilot) — potvrzuje znovupoužitelnost.
- **AI modaly (Generate Project) vnitřek** (fialovo-modré tinty uvnitř formuláře) ponechán na **Fázi 5/6** — Fáze 4 řeší jen portálové karty, ne obsah modalů.

## Odchylky od Design Bible
- Žádné.

## Ověření
- Projekty portál **Dark i Light**: emerald New/Generate karty, „AI ENGINE" emerald badge, rounder projektové karty, Fraunces „Vaše projekty.".
- Kalendář **Dark**: emerald toggle/nav, event chip s emerald tečkou, rounder panel, funkce (klik na event → drawer) zachována.
- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npm run build`: **úspěšný**.

## Dál (Fáze 5)
AI Studio + AI History: analytics dashboard, restyle `AiCharts` (elegantní grid, tlumené barvy, premium legenda), budget/metric karty (sdílená `MetricCard`), logy, timeline.

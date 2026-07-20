# Design Bible — Fáze 5: AI Studio + AI History

Povýšení AI Studia na premium analytics dashboard a AI History na konzistentní analytický jazyk. **Funkce beze změny** (statistiky, grafy, budget limit, logy, rozbalování řádků, mazání historie).

## AI Studio

### Grafy (`AiCharts`) — restyle
- **Tlumená paleta** (Design Bible: muted colors): barvy grafů z modré `#209dd7` / fialové `#753991` / amber → **emerald (`--accent`) + amber (`--warning`) + soft violet `#8b7fc7` + slate (`--text-muted`)**. Kategoriální pole hoistováno do jednoho `DIST_COLORS` (bez duplicit).
- Bar chart: sloupce emerald, prázdné `--surface-3`, cost dot amber, grid `--border`.
- Wrappery grafů → **`.cs-card`** (glass, radius-card, shadow) místo inline surface.

### Metric karty (`AiDashboardStats`) — adopce sdílené `MetricCard`
- 4 statistiky (požadavky / tokeny / náklady / latence) přepsány na **`MetricCard`** — stejná komponenta jako board Stats (Design Bible: „every metric card shares one reusable component"). Emerald ikony, uppercase label, velké číslo, popis jako trend.
- Do `MetricCard` přidán prop **`hideTrail`** (analytics karty nemají klikací chevron).

### Budget (`AiBudgetWidget`)
- Progress bar barva: fialová `#753991` → **emerald** (`--accent`); 80 % práh amber (`--warning`); 100 % `--danger`. Save ikona `#10b981` → `--success`.
- Wrapper → `.cs-card`.

### Tabulky (`AiFeatureBreakdown`, `AiRequestHistory`)
- Header pozadí `rgba(0,0,0,0.02)` → **`--surface-2`** (lepší kontrast v Dark mode). Kategoriální tečky → emerald/amber/violet. `#10b981` → `--success`.

## AI History
- Odstraněny poslední hardcoded barvy (`#10b981` → `--success`); accent aliasy (`--purple-secondary`/`--blue-primary`) už emerald z Fáze 0. Empty state + timeline v konzistentním emerald/glass jazyce, Fraunces hero nadpis.

## Změněné soubory
- `src/components/ai/AiCharts.tsx` — muted paleta, `.cs-card`, `DIST_COLORS` bez duplicit.
- `src/components/ai/AiDashboardStats.tsx` — adopce `MetricCard`.
- `src/components/ui/MetricCard.tsx` — prop `hideTrail`.
- `src/components/ai/AiBudgetWidget.tsx` — emerald bar, `.cs-card`, `--success`.
- `src/components/ai/AiFeatureBreakdown.tsx` — emerald tečky, `--surface-2` header.
- `src/components/ai/AiRequestHistory.tsx` — `--surface-2` header, `--success`.
- `src/app/ai-history/page.tsx` — `#10b981` → `--success`.

## Důležitá rozhodnutí
- **`MetricCard` sjednocena napříč Stats + AI Studio** — naplnění Bible „one reusable metric card". Cena: AI stat ikony ztratily kategoriální barvy (blue/amber/purple) ve prospěch konzistentního emeraldu. Vyhodnoceno jako správný tradeoff (konzistence > kategoriální ikony).
- **Grafy zůstávají vlastní SVG/HTML** (žádná Chart.js závislost) — jen restyle. „Avoid default Chart.js" je tím splněno automaticky.

## Odchylky od Design Bible
- Žádné.

## Ověření
- AI Studio **Dark**: MetricCard statistiky, emerald bar chart + muted legenda, emerald distribuce, budget na glass kartě, tabulky s čitelnými hlavičkami. AI History: cohesivní empty state / timeline.
- Token-based → Light nese stejně (ověřeno napříč fázemi 0–4).
- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npm run build`: **úspěšný**.

## Dál (Fáze 6)
Tým + AI modaly (Generate Project/Sprint/Tasks/Risk) + Project Intelligence panel — member karty, avataři, invite dialog, adopce `ModalShell`/`Button`, dořešení fialovo-modrých tintů uvnitř AI modalů.

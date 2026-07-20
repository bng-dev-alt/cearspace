# Design Bible — Fáze 7: Finální sweep + shrnutí redesignu

Uzavírací fáze: konzistenční sweep, přístupnost, responzivita, úklid. Tímto je kompletní vizuální redesign dle `ClearSpace_Design_Bible_v1.0.md` hotový.

## Co bylo upraveno (Fáze 7)

### Konzistenční sweep — nula starých akcentů
- Odstraněny **poslední fialovo-modré** relikvie napříč `globals.css`, login/register (ambient bloby), AI History (stíny). Vše na `var(--accent-soft)` / `var(--accent)`.
- Login/register ambient „záře" (radial gradienty) → **emerald** — přesně Bible „ambient light / calm gradients" na pevné ocean-navy ploše.
- Hardcoded červené bordery chybových hlášek (`#fecaca` / `#fca5a5`) → `var(--danger-soft)` (konzistentní v Dark i Light).
- **Kontrola:** `grep` starých akcentů (teal/modrá/fialová) napříč `src` = **0** (mimo záměrné identitní barvy avatarů v `dummyData`).

### Responzivita
- **Stat dlaždice** (`MetricCard`) se na úzkých obrazovkách nezalamovaly → překryv textu. Přidán `flex-wrap` na `.app-stats-row` + `flex: 1 1 150px; min-width: 150px` na dlaždice → **desktop 4 v řadě, mobil zalomení / plná šířka**. Ověřeno na 375px i desktopu.

### Přístupnost
- `:focus-visible { outline: 2px solid var(--accent) }` (Fáze 0) platí globálně; primitivy `.cs-btn`/`.cs-metric` mají vlastní focus ring. Klávesnicová navigace beze změny.
- `prefers-reduced-motion` respektováno v `design-system.css` (modaly, hover lift).

### Empty states / tabulky
- Projekty → `EmptyState` primitiv (Fáze 4). AI tabulky mají token-based inline placeholdery (přiměřená velikost pro vnořený kontext). Členská tabulka + AI logy na tokenech.

## Změněné soubory (Fáze 7)
- `src/app/globals.css` — poslední staré akcenty → emerald, `.app-stats-row` flex-wrap.
- `src/app/login/page.tsx`, `src/app/register/page.tsx` — ambient bloby emerald, error border token.
- `src/app/ai-history/page.tsx` — stín token.
- `src/components/board/GenerateTasksModal.tsx`, `GenerateProjectModal.tsx`, `TaskDetailDrawer.tsx`, `src/components/ai/AiRequestHistory.tsx` — error border token.
- `src/components/toolbar/StatsRow.tsx` — responsivní flex.

## Ověření (Fáze 7)
- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npm run build`: **úspěšný** · **E2E `test:e2e`: 6/6**.
- Board Dark/Light, projekty, kalendář, AI Studio/History, tým, AI modaly, PI panel — cohesivní. Mobil (375px) + desktop responzivní.

---

# Shrnutí celého redesignu (Fáze 0–7)

| Fáze | Výsledek |
|---|---|
| 0 | Token foundation — muted emerald, Fraunces serif (next/font), radius 14/18/24/28, glass 90–95 %, motion |
| 1 | Primitivy — `design-system.css` (.cs-*) + `components/ui/` (Button, MetricCard, EmptyState, ModalShell, Badge) |
| 2 | *(Login přeskočen — dostal emerald/Fraunces/dark-fix dřív)* |
| 3 | Board + chrome — karty, sloupce, count pilulky, focus |
| 4 | Projekty portál + Kalendář — emerald karty, EmptyState |
| 5 | AI Studio + History — MetricCard, restyle grafů (muted paleta), budget, tabulky |
| 6 | Tým + AI modaly + PI — sjednocení emerald, member avatary zachovány |
| 7 | Finální sweep — konzistence, responzivita, a11y, úklid |

## Definition of Done (Design Bible)
- ✓ UX / funkce / drag & drop beze změny (E2E 6/6, 100 unit testů)
- ✓ Login (emerald/Fraunces/dark-fix), Board, Projekty, Kalendář, AI Studio, AI History, Tým — redesignováno
- ✓ Empty states, tabulky, grafy — sjednoceno
- ✓ Dark i Light kompletní
- ✓ Jeden koherentní design jazyk (Organic Glass Workspace)
- ⚠️ Settings — mimo scope (obrazovka neexistuje; vědomé rozhodnutí)

## Známé / vědomé
- **AI modaly** používají vlastní strukturu (ne `ModalShell` primitiv) — kvůli složité logice/tabům, vizuálně konzistentní přes tokeny.
- **`--success`** je z emerald rodiny (blízko akcentu) — zatím ponecháno, bez konfliktu v praxi.
- Mrtvé styly (např. původní `.stat-card`) ponechány neaktivní — neškodí; volitelný úklid kdykoliv.
- Toolbar má na velmi úzkých obrazovkách hustotu tlačítek (pre-existing, mimo vizuální redesign).

**Redesign kompletní.** Připraveno k pushnutí (dle dohody po dokončení všech fází).

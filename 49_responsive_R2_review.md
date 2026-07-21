# Responsive R2 — Tablet (768–1023)

Druhá fáze. Cíl: použitelný a čistý tablet. **Desktop ověřeně beze změny.**

## Co bylo uděláno

### Narovnání inline stylů do CSS (předpoklad responzivity)
Toolbar a stats měly layout v **inline stylech**, které mají vyšší specificitu než media query — responzivní pravidla by na ně nedosáhla. Přesunuto do CSS **se zachováním identických hodnot** (desktop pixelově stejný):
- `.app-toolbar` — `flex-direction/align-items/gap/padding` z inline → CSS
- nová třída **`.toolbar-main-row`** (dřív bezejmenný `<div>` s inline stylem)
- `.toolbar-left` — `flex: 1; flex-wrap: wrap`
- `StatsRow` — odstraněn inline `FILL`; rozměry řeší `.app-stats-row > .cs-metric`

> **Proč:** bez toho by se responzivita musela dělat přes `!important` nebo duplicitní komponenty — obojí dokument zakazuje.

### Tablet layout
- **Toolbar: ze tří roztrhaných řad na dvě čisté** — filtry (hledání, Filtry, řazení, avataři) nahoře, akce (Project Intelligence, Nový úkol) zarovnané doprava pod nimi.
- **Popisek „Členové projektu" skryt** (`.toolbar-team-label`) — **avataři zůstávají a jsou klikatelné**, takže funkce zůstává plně dostupná, jen se ušetří ~130 px.
- **Stats: přesně 2×2** místo 4 vedle sebe, kde se text překrýval („CELKEM ÚKOL…", „BLOKOVÁNO 1 Vyřešit").
- **Hero titulek** 3.25rem → **2.6rem** (jen tablet) — kompaktnější, zachovává premium dojem.

### Sekce RESPONSIVE OVERRIDES + poučení z kaskády
Během fáze se ukázalo, že media query umístěná **před** základním pravidlem při stejné specificitě **prohrává** (stats zůstaly 4 v řadě). Zavedena proto sekce **RESPONSIVE OVERRIDES na konci `globals.css`** — komponentní breakpointy patří až za základní pravidla. Zadokumentováno v komentáři.

Kde už mobilní pravidlo existuje výš v souboru (hero titulek), použit **rozsah `min-width: 768px and max-width: 1023px`**, aby tablet nepřebil mobil.

## Změněné soubory
- `src/components/toolbar/Toolbar.tsx` — inline → třídy (`toolbar-main-row`, `toolbar-team-label`)
- `src/components/toolbar/StatsRow.tsx` — odstraněn inline `FILL`
- `src/app/globals.css` — CSS toolbaru/stats, sekce RESPONSIVE OVERRIDES, tablet pravidla

## Ověření
| Šířka | Výsledek |
|---|---|
| **1440** | **Identické** ✅ — toolbar jedna řada, stats 4 v řadě, stejné rozestupy |
| **768** | Toolbar 2 čisté řady ✅ · stats **2×2 bez překryvu** ✅ · hero kompaktnější ✅ · kalendář čitelný ✅ |
| **375** | Zdědil zlepšení (stats 2×2, skrytý popisek); hero drží svou velikost (rozsahová media query funguje) ✅ |

- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npm run build`: **úspěšný**

## Známé, řeší další fáze
- **Mobilní toolbar stále přetéká** (393 px > 375 px) kvůli „Nový úkol" → **R3/R4** (přesun akcí do hamburgeru).
- Popisky stats se na mobilu ještě lámou („V PRŮBĚH…", těsné „BLOKOVÁNO") → **R4** (kompaktnější varianta metrikové dlaždice).

## Dál
**R3 — Mobilní navigace (hamburger menu).**

# Responsive R1 — Breakpoint foundation

První fáze responzivní implementace. Cíl: **jednotná breakpoint škála + responzivní stránkový gutter**, aby na nich stavěly další fáze. **Desktop vizuálně beze změny.**

## Co bylo uděláno

### Jednotná breakpoint škála
Zavedena a zadokumentována přímo v `globals.css`:
- **Desktop ≥ 1024px** — referenční, beze změny
- **Tablet ≤ 1023px**
- **Mobil ≤ 767px**

Stávající mobilní pravidla migrována `max-width: 768px` → **767px** (navbar, hero, toolbar, drawer, kalendář), aby 768px nově patřilo tabletu.

### Token `--page-pad` (stránkový gutter)
Horizontální okraj stránky byl na 8 místech natvrdo `3rem`. Zaveden jediný zdroj pravdy:
```
--page-pad: 3rem;                 /* desktop */
@media (max-width:1023px) 1.5rem  /* tablet */
@media (max-width: 767px) 1rem    /* mobil  */
```
Napojeno: navbar, hero (vč. výškových variant), toolbar, stats row, board panel, kalendář, tým — celkem **13 použití**. Navázány i závislé šířky `calc(100% - 6rem)` → `calc(100% - var(--page-pad) * 2)`, aby se nerozešly s guttrem.

**Proč tokenem, a ne per-komponentní media query:** komponenty pak samy nic responzivního neřeší, gutter se ladí na jednom místě a nevzniká duplicita (požadavek dokumentu na „no duplicated layouts").

### Vědomá výjimka
Tabulka Týmu si drží vlastní breakpoint **820px** (6 sloupců ~750px se do 768 nevejde, ale mezi 820–1023 ano). Okomentováno přímo u pravidla.

## Změněné soubory
- `src/app/globals.css` — breakpoint škála, token `--page-pad` + 13 použití, migrace 768→767, komentář u výjimky 820.

## Ověření
| Šířka | Výsledek |
|---|---|
| **1440 (desktop)** | **Vizuálně identické** ✅ (gutter zůstal 3rem) |
| **768 (tablet)** | Funkční; gutter 1.5rem dal obsahu víc místa, navbar se vejde v plné podobě. Toolbar/stats/hero čekají na R2. |
| **375 (mobil)** | Zlepšení „zdarma": hero titulek **3 → 2 řádky**, info karty se **obě vejdou** (dřív oříznuté), stats se poskládaly do **2×2**. |

- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npm run build`: **úspěšný**

## Známé, řeší další fáze
- **Toolbar na mobilu stále přetéká** (naměřeno 401px > 375px viewport) — způsobeno tlačítky „Project Intelligence" + „Nový úkol". **Řeší R3/R4** přesunem obou do hamburger menu (dle dokumentu).
- Stats labely se na mobilu ještě lámou / překrývají („V PRŮBĚH…", „BLOKOVÁNO 1 Vyřešit") — **R4**.
- Tablet toolbar/hero/stats — **R2**.

## Dál
**R2 — Tablet:** toolbar do jednoho čistého řádku, stats 2×2, hustota kalendáře, šířky dialogů.

# Responsive R6 — Kalendář na mobilu

Šestá fáze. Cíl: použitelný kalendář na 375 px. **Desktop ověřeně beze změny.**

## Problém
Mřížka má 7 sloupců, takže na 375 px vychází buňka na **~49 px**. Chip s názvem úkolu se do ní nevejde ani zdaleka — zbyla z něj barevná tečka a pár pixelů textu. Zmenšování písma (dosavadní mobilní pravidlo `0.65rem`) problém neřešilo, jen ho zdrobnilo.

## Řešení
Podle domluvy: **kompaktní mřížka s tečkami + klepnutí na den rozbalí seznam** pod kalendářem.

### Jedna komponenta, dvě podoby
Neudělal jsem mobilní klon `CalendarView`. Komponenta renderuje **obě prezentace** a přepíná mezi nimi CSS:

| Prvek | Desktop | Mobil |
|---|---|---|
| `.calendar-day-cards` (chipy s názvy) | viditelné | `display: none` |
| `.calendar-day-dots` (tečky dle priority) | `display: none` | viditelné |
| `.calendar-day-tap` (dotyková vrstva) | `display: none` | přes celou buňku |
| `.calendar-day-detail` (rozbalený den) | `display: none` | pod mřížkou |

Dotyková vrstva je `position: absolute; inset: 0` **jediné** tlačítko přes buňku — díky tomu se nemusí duplikovat číslo dne ani obsah. Na desktopu má `display: none`, takže **není v accessibility stromu ani ve fokusovém pořadí** a kalendář tam zůstává read-only přesně jako dosud (ověřeno testem).

### Bez `setState` v efektu
Po přelistování měsíce může vybraný den z mřížky zmizet. Místo čištění stavu efektem se výběr **odvozuje**:

```ts
const activeKey =
  selectedKey && weeks.some((w) => w.some((d) => localKey(d) === selectedKey)) ? selectedKey : null;
```

Neplatný výběr se prostě ignoruje — žádný efekt, žádný extra render, žádná potřeba `eslint-disable`.

### Detaily
- Tečky barevné podle priority (`getPriorityColor`), max 3, pak `+N`.
- Buňka má `min-height: 46px` — dotykový cíl.
- V rozbaleném seznamu se název **rozepíše na víc řádků** (v mřížce je zkrácený), chip má 44 px výšky a klik otevře detail úkolu.
- Popisek data: `::first-letter`, ne `text-transform: capitalize` — ta by z „pátek 10. července" udělala „Pátek 10. Července", což je česky špatně.

## Změněné soubory
- `src/components/board/CalendarView.tsx` — tečky, dotyková vrstva, detail dne
- `src/components/layout/Navbar.tsx` — `data-testid` na položky Board/Kalendář v menu
- `src/app/globals.css` — blok „R6"
- `e2e/kanban.spec.ts` — mobilní i desktopový test kalendáře

## Ověření
| | Výsledek |
|---|---|
| **375** | Celý měsíc na jedné obrazovce, tečky čitelné ✅ · klepnutí rozbalí „čtvrtek 16. července" ✅ · klik na kartu otevře správný úkol („Napsat unit testy pro autentizaci") ✅ · žádné vodorovné přetékání (375/375) ✅ |
| **1440** | **Identické** ✅ — buňka 116 px, chipy s názvy v buňkách, `.calendar-day-tap` i `.calendar-day-dots` `display: none`, detail se nezobrazuje |

- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npx playwright test`: **14/14** · `npm run build`: **úspěšný**

## Dál
**R7 — Přístupnost a výkon** (dotykové cíle 44×44 napříč aplikací, fokus, kontrast).

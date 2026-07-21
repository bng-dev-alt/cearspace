# Responsive R4 — Mobilní layout (hero · toolbar · stats · sloupce)

Čtvrtá fáze. Cíl: čitelný a hustší mobilní layout. **Desktop i tablet ověřeně beze změny.**

## Co bylo uděláno

### Stats — konec lámání popisků
Hlavní bolest z auditu. Na 375 px se popisky lámaly přes ikonu („V PRŮBĚH…", překrývající se „BLOKOVÁNO 1 Vyřešit").

Řešení: kompaktnější dlaždice (menší ikona 42 → 34 px, menší padding) a **skrytý trailing chevron**. Ten je v `MetricCard` vykreslený s `aria-hidden="true"` — je čistě dekorativní, takže se skrytím nic neztrácí. **Akční prvek „Vyřešit" u blokovaných zůstává.** Uvolněné místo stačí na celé popisky.

> Tyto styly jsem dal do `design-system.css`, ne do `globals.css`. `design-system.css` se importuje **až po** `globals.css`, takže by při stejné specificitě přebil override v globals. Styly komponenty navíc patří ke komponentě.

### Sloupce — pevná šířka a peek
`.column` mělo `flex: 1; min-width: 260px`, takže se šířka měnila podle počtu sloupců. Na mobilu **pevných 280 px** → při kontejneru 341 px zbývá **61 px peek** na další sloupec, takže je na první pohled zřejmé, že se scrolluje do strany. Přidán `scroll-snap-type: x proximity` (proximity, ne mandatory — nebere uživateli volný scroll).

### Toolbar — dvě plné řady místo tří skoro prázdných
`.toolbar-left` a `.toolbar-right` jsou dvě flex skupiny, takže se jejich obsah nemohl slévat a vznikaly poloprázdné řady. Na mobilu dostávají **`display: contents`** — děti obou skupin tečou v jednom wrapu.

Zároveň `justify-content: space-between` → `flex-start`: po rozpuštění skupin by se ovládání rozletělo na oba kraje řady a mezi ně by zbyla díra.

### Hero — kompaktnější
Titulek **33,6 → 29,6 px** (limit zadání je 32 px), menší vertikální padding, hero karty z pevných 185 px na půlky řádku (`flex: 1 1 0`), aby se text méně lámal.

## Změněné soubory
- `src/app/design-system.css` — mobilní varianta `.cs-metric*`
- `src/app/globals.css` — blok „R4: mobilní layout"
- `e2e/kanban.spec.ts` — test pevné šířky sloupce a peeku

## Ověření (naměřeno v prohlížeči)
| Prvek @375 | Před R4 | Po R4 |
|---|---|---|
| Stats blok | 197 px, popisky lámané | **148 px, popisky celé** ✅ |
| Hero | 275 px, titulek 33,6 px | **256 px, titulek 29,6 px** ✅ |
| Toolbar | 133 px | **124 px, ikony srovnané** ✅ |
| Sloupec | 260 px, proměnlivý | **280 px pevně, peek 61 px** ✅ |
| Vodorovné přetékání | — | **375/375, žádné** ✅ |

| Šířka | Výsledek |
|---|---|
| **1440** | **Identické** ✅ — titulek 33,6 px, `toolbar-left: flex`, `space-between`, chevron viditelný, sloupec 260 px |
| **768** | **Beze změny proti R2/R3** ✅ — titulek 41,6 px, chevron viditelný, sloupec 260 px, 753/753 |

- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npx playwright test`: **10/10** · `npm run build`: **úspěšný**

## Poznámka k výšce nad ohybem
Hero + toolbar + stats zaberou na 375×812 pořád ~530 px, takže board začíná níž, než by bylo ideální. Dál už se to nedá stlačit bez **změny layoutu nebo skrývání obsahu**, což zadání zakazuje.

Existuje ale hotová cesta, kterou nechávám na tobě: hero je **sbalitelné** tlačítkem „i" v toolbaru. Kdybys chtěl, můžu na mobilu nastavit **výchozí stav sbalený** (preference se ukládá, na desktopu beze změny). Je to změna výchozího chování, tak ji nedělám bez tvého slova.

## Známé, řeší další fáze
- Hlavička draweru (Project Intelligence i detail úkolu) na 375 px přetéká — pozicovací bar a křížek jsou uříznuté, panel jde zavřít jen Escapem → **R5**.
- Modaly zatím nejsou na mobilu fullscreen → **R5**.

## Dál
**R5 — Dialogy a drawery na mobilu** (fullscreen, lepivá hlavička a patička).

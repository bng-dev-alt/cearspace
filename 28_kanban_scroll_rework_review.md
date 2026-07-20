# Review - Kanban Scroll Rework (UX)

Změna způsobu scrollování Kanban boardu: hlavní vertikální scroll nově probíhá na úrovni celé stránky, ne uvnitř jednotlivých sloupců. Sloupce rostou podle počtu karet, stránka se prodlužuje. Čistě layoutová změna -- Drag & Drop, logika boardu, komponentová architektura, workflow, AI funkce ani Theme System se neměnily.

## 1. Co způsobovalo původní problém

Layout byl uzamčen na výšku viewportu a scroll byl vytlačen dovnitř sloupců -- řetězec:

- `body { overflow: hidden }` + `.app-container { height: 100vh }` → celá aplikace fixně na výšku okna.
- `.board-panel-card { flex: 1; min-height: 0 }` → board vyplnil zbylé místo a dál nerostl.
- `.cards-list { overflow-y: auto }` → **karty se scrollovaly uvnitř každého sloupce.**

Na noteboocích (13–15") tak hero + toolbar + statistiky snědly velkou část výšky a na board zbyla malá plocha s vnitřním scrollem ve sloupci -- přesně nechtěné chování.

## 2. Jak bylo scrollování změněno (nejčistší řešení, ne workaround)

Přechod z modelu „fixní viewport → scroll uvnitř sloupce" na **model dokumentového scrollu**:

- **`body`**: z fixního `height: 100%` na `min-height: 100%` → body roste s obsahem a scrolluje se celý dokument (ne vnitřek boardu). `overflow-x: clip` potlačuje vodorovný scroll stránky, aniž by (na rozdíl od `overflow-x: hidden`) vytvořil svislý scroll-kontejner na body.
- **`.app-container`**: `height: 100vh` → `min-height: 100vh` → kontejner roste s obsahem.
- **`.board-panel-card`**: odstraněno `flex: 1; min-height: 0` → karta boardu se přizpůsobí obsahu místo vyplnění viewportu.
- **`.board-container`**: odstraněno `flex: 1` (ponechán jen horizontální scroll sloupců).
- **`.cards-list`**: odstraněno `overflow-y: auto` (a mrtvé scrollbar styly) → **seznam karet už nescrolluje interně, roste podle počtu karet.** `flex: 1` drží tlačítko „Nový úkol" u spodního okraje sloupce.

Klíčový detail: původní `height: 100%` na `body` v kombinaci s `overflow-x` dělal z body scroll-kontejner o výšce viewportu, takže i po ostatních změnách se board scrolloval „uvnitř". Teprve `min-height` + `overflow-x: clip` uvolnily scroll na úroveň dokumentu.

## 3. Jaké layout změny byly potřeba

- Sloupce jsou přes `align-items: stretch` stejně vysoké (čistý obdélník boardu); výšku určuje nejvyšší sloupec a podle něj roste stránka.
- Navbar zůstává `position: sticky` -> při scrollu tapetuje nahoře a navigace je stále dostupná.
- **Responsivní hero na noteboocích** (klíčováno na výšku viewportu, aby board dostal víc místa; desktop beze změny):
  - `@media (max-height: 900px)`: hero max-height ~232 px, menší titulek, skrytý popisek, kompaktnější glass karty a rozestupy.
  - `@media (max-height: 700px)`: ještě kompaktnější hero (~180 px).

## 4. Dopady na UX

- **Notebook (13–15"):** board má výrazně větší využitelnou plochu; scrolluje se přirozeně kolečkem/trackpadem přes celou stránku, žádný „scroll ve scrollu" uvnitř sloupce. Ověřeno se sloupcem o 18 kartách -- všechny dosažitelné běžným scrollem stránky (`document.scrollHeight` roste, `cards-list` bez interního scrollu).
- **Desktop:** při vysokém viewportu hero i rozvržení zůstávají v původní podobě.
- Horizontální scroll sloupců (při mnoha sloupcích) zůstává lokálně v boardu; vodorovný scroll stránky je potlačen (`overflow-x: clip`, ověřeno `scrollWidth === innerWidth`).
- **Drag & Drop** je nezávislý na scroll modelu (mění se jen CSS layout, ne DnD logika) -- kryto stávajícím regresním testem.

## 5. Ověření

| Kontrola | Výsledek |
|---|---|
| Notebook 1366×768, sloupec s 18 kartami | stránka scrolluje, sloupec roste, **žádný interní scroll sloupce** |
| Sticky navbar při scrollu | ✓ zůstává nahoře |
| Desktop 1512×982 | hero i layout zachovány |
| Dark mode / Light mode | ✓ obojí funkční |
| Horizontální scroll stránky | ✓ žádný (`overflow-x: clip`) |
| Drag & Drop | logika nezměněna, kryto testem routingu karta/sloupec |

## 6. Výsledky

- `npm run lint`: **0 chyb, 0 varování.**
- `npm run build`: **úspěšný** (Compiled + TypeScript OK, 14/14 stránek).
- `npx vitest run`: **92/92 testů prošlo v 17 souborech.**

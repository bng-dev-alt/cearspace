# Responsive R5 — Dialogy a drawery na mobilu

Pátá fáze. Cíl: panely a dialogy použitelné na 375 px. **Desktop ověřeně beze změny.**

## Co bylo uděláno

### Pozicovací bar pryč z mobilu (hlavní bolest z R3/R4)
Na mobilu je drawer vždy přes celou obrazovku, takže volba Left / Focused / Right **nemá co ovlivňovat** — jen přetékala hlavičku a **vytlačila z ní křížek mimo obrazovku**. Panel šel zavřít jen Escapem.

Na mobilu se bar skrývá. Uložená preference zůstává, na desktopu se nic nemění.

> Bar v `TaskDetailDrawer` byl v **inline stylech**, takže by na něj media query nedosáhla. Přesunut do třídy `.drawer-mode-switch` s **identickými hodnotami** a sdílený s `.pi-mode-switch` v PI panelu. Třetí výskyt téže pasti (R2 toolbar, R3 navbar) — v kódu je u ní poznámka.

### Meta grid detailu úkolu se přestal ořezávat
`.drawer-meta-grid` má na desktopu sloupce `140px 1fr`. Na 375 px ho **min-content obsahu roztlačil za okraj** (datum + „Vymazat", jmenovky přiřazených) — selecty i odkaz „Vymazat" byly uříznuté.

Na mobilu jde **popisek nad hodnotu**, pole dostanou celou šířku. Naměřeno: `scrollWidth 391 → 375`, žádný vodorovný scroll.

### Sklo → plná plocha
`.drawer-content` má `rgba(15,40,51,0.9)` a **`backdrop-filter` se nikde neaplikoval**. U úzkého panelu na desktopu je to nenápadné; přes celou obrazovku pod ním leží celý board a text se s ním pral. Na mobilu tedy neprůhledný podklad.

### Dialogy fullscreen
`.modal-content` neměl **žádný `max-height`** a měl `overflow: hidden` — vyšší dialog by se na mobilu ořezal bez možnosti doscrollovat. Na mobilu je teď fullscreen (`100dvh`), flex sloupec: hlavička a patička drží, scrolluje jen tělo.

**Zádrhel:** patička nedosedala ke spodní hraně a zůstávala pod ní ~170px díra. Příčina: mezi `.modal-content` a obsahem je `<form>`, který výšku netáhl. Přidáno `.modal-content > form { flex: 1 1 auto; display: flex; flex-direction: column; }`.

Použito `100dvh`, ne `100%` — u fixed prvku se `100%` počítá k velkému viewportu a patička by na mobilu zmizela pod adresní lištou.

## Změněné soubory
- `src/components/board/TaskDetailDrawer.tsx` — pozicovací bar inline → třída
- `src/app/globals.css` — `.drawer-mode-switch`, blok „R5"
- `src/app/design-system.css` — fullscreen varianta `.cs-modal*`
- `e2e/kanban.spec.ts` — 2 testy + helper `settled()`

## Ověření
| Prvek @375 | Před R5 | Po R5 |
|---|---|---|
| Hlavička draweru | bar přetéká, křížek mimo obrazovku | **bar skrytý, křížek dostupný** ✅ |
| Meta grid | scrollWidth 391, pole uříznutá | **375, vše se vejde** ✅ |
| Podklad panelu | průsvitný, board prosvítá | **neprůhledný** ✅ |
| Dialog | 480 px na střed, bez max-height | **fullscreen, patička dosedá** ✅ |

| Šířka | Výsledek |
|---|---|
| **1440** | **Identické** ✅ — bar viditelný se stejným pozadím i rádiusem, meta grid `140px 1fr`, titulek 26,4 px, drawer sklo 0.9, dialog 480 px vycentrovaný, `overflow: hidden`, `form` bez flexu |

- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npx playwright test`: **12/12** · `npm run build`: **úspěšný**

> Nový E2E test nejdřív padal — rozměry se měřily uprostřed `scaleIn` animace (367 px místo 375). Neřešil jsem to čekáním na časovač, ale helperem `settled()`, který počká na `getAnimations().finished`. Deterministické.

## Známé, řeší další fáze
- Dotykové cíle mimo mobilní menu ještě nejsou proměřené na 44×44 → **R6/R7**.
- Kalendář na mobilu zatím neřešen → **R6**.

## Dál
**R6 — Kalendář na mobilu** (kompaktní měsíční mřížka s tečkami, tap na den rozbalí seznam).

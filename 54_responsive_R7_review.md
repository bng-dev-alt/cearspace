# Responsive R7 — Přístupnost

Sedmá fáze. Dotykové cíle, kontrast, fokus. **Desktop layout ověřeně beze změny** (jediná záměrná výjimka je odstín `--text-muted`, viz níže).

## 1. Dotykové cíle 44×44

Proměřil jsem **každý interaktivní prvek** na 375 px skriptem přes všechny obrazovky a stavy. Výsledek před opravou:

| Obrazovka | Prvků pod 44 px | Nejmenší |
|---|---|---|
| Board | 23 | 18×18 |
| Detail úkolu | 15 | 14×14 |
| Dialog | 8 | 35 px na výšku |
| Tým | 14 | 15 px na výšku |
| AI Studio | 2 | 20×20 |
| Projekty | 1 | 24×24 |
| Kalendář / PI / menu | 5 | 30×30 |

**Po opravě: 0** (kromě jedné zdokumentované výjimky). Přibyl E2E test, který to hlídá.

### Dva nálezy, které nebyly o velikosti

**Mazání karty bylo na dotyku neviditelná past.** `.card-delete-btn` má `opacity: 0` a odkrývá se na `:hover`, který na dotyku neexistuje. Jenže **`opacity: 0` nevypíná `pointer-events`** — tlačítko tedy zůstávalo aktivní a klepnutí do pravého horního rohu karty smazalo úkol bez varování. Na mobilu je teď `display: none`; mazání zůstává dostupné v detailu úkolu.

**AI Studio přetékalo o 181 px.** Inline mřížka `3fr 1fr` se na mobilu nesložila (a media query na inline styl nedosáhne). To je porušení **WCAG 1.4.10 Reflow**, takže patří sem, ne až do polishe. Layout přesunut do `.ai-cc-charts-grid` s identickými hodnotami, na mobilu jeden sloupec.

### Výjimka
`.assignee-badge-remove` (×  uvnitř jmenovky přiřazeného) je **24×24**. Roztažení na 44 px by rozbilo chip; **WCAG 2.5.8 (AA)** pro takové inline ovládání 24×24 připouští. Je to jediný prvek pod 44 px a v CSS je u něj poznámka proč.

### Cena
Toolbar na mobilu vyrostl **124 → 169 px**. Vědomá výměna: 28px vysoký select se na telefonu trefuje špatně. Hustota z R4 se tím částečně vrací, ale trefitelnost je důležitější.

## 2. Kontrast

`--text-muted` propadal AA v **obou** motivech:

| | před | po |
|---|---|---|
| Tmavý, na `--surface` | 4.02 ❌ | **5.08** ✅ |
| Světlý, na `--surface` | 3.16 ❌ | **4.99** ✅ |
| Světlý, na `--surface-2` | 2.88 ❌ | **4.54** ✅ |

Je to neutrální šedá (popisky, placeholdery, podtitulky), takže ztmavení není na pohled poznat — ověřeno screenshotem desktopu.

### Co jsem NEopravil a proč
Ve **světlém** motivu propadají i dvě **brandové** barvy z Design Bible:

| Token | Na bílé | Potřeba | Návrh |
|---|---|---|---|
| `--accent` `#0f9d6e` | **3.46** ❌ | 4.5 | `#0b7d57` (5.14) |
| `--danger` `#e5484d` | **3.91** ❌ | 4.5 | `#d13438` (4.93) |

Týká se to accentu **jako textu** (aktivní odkaz v navigaci, „Vyřešit →"). Jako výplň tlačítka s bílým textem je accent v pořádku. V tmavém motivu obě projdou (7.20 / 5.54).

**Nesáhl jsem na ně sám** — je to barva značky z tvého Design Bible a její ztmavení je viditelné na celém desktopu. Rozhodnutí je na tobě, hodnoty mám připravené.

## 3. Fokus
Globální `:focus-visible` ring už existoval (2px accent, offset 2px) a pokrývá všechny prvky. Nově přidané ovládání (dotyková vrstva dne v kalendáři) má vlastní `outline-offset: -2px`, aby nevyčnívalo z buňky. Beze změn.

## Změněné soubory
- `src/app/globals.css` — `--text-muted` (oba motivy), `.ai-cc-charts-grid`, blok „R7"
- `src/components/layout/HeroSection.tsx`, `board/TaskDetailDrawer.tsx`, `board/MultiAssigneeSelect.tsx`, `dashboard/ProjectDashboard.tsx`, `ai/AiBudgetWidget.tsx`, `app/ai-control-center/page.tsx`, `app/ai-history/page.tsx` — **jen doplnění `className`** k tlačítkům, která měla pouze inline styly (bez nich na ně breakpoint nedosáhne). Žádná změna chování.
- `e2e/kanban.spec.ts` — regresní test dotykových cílů

## Ověření
| | Výsledek |
|---|---|
| **375** | 0 prvků pod 44 px na všech stránkách ✅ · žádné vodorovné přetékání nikde (375/375) ✅ |
| **1440** | Layout **identický** ✅ — `.column-header-plus` 20 px, `.card-delete-btn` viditelné, toolbar bez `min-height`, mřížka AI Studia `3fr 1fr` |

- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npx playwright test`: **15/15** · `npm run build`: **úspěšný**

## Dál
**R8 — finální polish a závěrečný report.**

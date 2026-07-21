# Responsive R8 — Finální polish a závěrečný report

Poslední fáze. Doladění, dotažení pokrytí testy a shrnutí celé responzivní etapy.

---

## Část 1: Co R8 opravilo

### Reflow na 320 px (nová zjištění)
Všechny předchozí fáze jsem měřil na **375 px**. Prahová hodnota WCAG 1.4.10 je ale **320 px** — a tam se ukázaly dvě chyby, které na 375 nebyly vidět:

| Stránka | Přetečení | Příčina |
|---|---|---|
| AI Studio | **24 px** | `AiCharts`: inline `minmax(320px, 1fr)` — mřížka nemůže být užší než 320 px, takže na 320px displeji přeteče o padding |
| Tým | **10 px** | `.team-toolbar-actions` se nezalamoval |

Opraveno vzorem **`minmax(min(320px, 100%), 1fr)`** — na desktopu se chová identicky (`min()` vybere 320 px, když je místo), na úzkém displeji se složí. Stejný vzor jsem preventivně aplikoval na další tři mřížky se stejnou konstrukcí (`ProjectDashboard`, `AiRequestHistory`, `RiskAnalysisModal`), aby stejná chyba nečekala v modalu, který jsem neotevřel.

### Animace dialogu
Fullscreen dialog na mobilu dosud používal `scaleIn`, takže **zoomoval celou obrazovku**. Nahrazeno vyjetím zespodu (`modalSlideUp`), včetně `prefers-reduced-motion` výjimky.

### Trvalý reflow test
Dočasný ověřovací skript jsem přepsal na `e2e/reflow.spec.ts`: **5 stránek × 5 šířek** (320 / 375 / 768 / 1024 / 1440). Chytá přesně ten typ regrese, který R8 našel — nenápadný `minmax()` v nové mřížce.

---

## Část 2: Celková bilance R1–R8

### Testy
| | Před etapou | Po |
|---|---|---|
| Unit (Vitest) | 100 | **100** |
| E2E (Playwright) | 6 | **20** |
| Lint | 0 chyb | **0 chyb** |
| Build | OK | **OK** |

14 nových E2E testů: mobilní navigace, šířka sloupců, fullscreen drawer a dialog, kalendář (mobil i desktop), dotykové cíle, reflow na 5 šířkách.

### Naměřené výsledky na 375 px
| Prvek | Před R1 | Po R8 |
|---|---|---|
| Vodorovné přetečení | 393 px > 375 | **žádné, i na 320 px** |
| Stats blok | 197 px, popisky lámané | 148 px, popisky celé |
| Sloupec | 260 px, proměnlivý | 280 px pevně, peek 61 px |
| Hlavička draweru | křížek mimo obrazovku | dostupný |
| Dialogy | bez `max-height`, ořezávaly se | fullscreen, patička dosedá |
| Kalendář | názvy v ~49px buňce | tečky + rozbalení dne |
| Dotykové cíle pod 44 px | **63** | **0** (1 doložená výjimka) |
| Kontrast `--text-muted` | 3.16 / 4.02 ❌ | 4.99 / 5.08 ✅ |

### Desktop
Po každé fázi jsem 1440 px ověřoval **měřením konkrétních hodnot**, ne pohledem: velikost titulku, `display` skupin toolbaru, `grid-template-columns`, rozměry sloupce a dlaždic, chování draweru a dialogu.

**Jediná záměrná změna, která je vidět i na desktopu: odstín `--text-muted`** (ztmavený kvůli kontrastu). Vše ostatní je za `@media (max-width: 767px)` nebo přesun inline stylu do CSS s identickými hodnotami.

---

## Část 3: Co jsem se v téhle etapě naučil o téhle codebase

**Inline styly byly hlavní překážkou responzivity.** Narazil jsem na ně **pětkrát** a pokaždé stejně: media query na inline styl nedosáhne, takže breakpoint tiše nefunguje.

| Fáze | Prvek |
|---|---|
| R2 | `.app-toolbar`, `.toolbar-main-row`, `StatsRow` |
| R3 | `.navbar-right` |
| R5 | pozicovací bar draweru |
| R7 | 7 tlačítek napříč stránkami |
| R8 | `minmax()` mřížky |

Řešení bylo pokaždé stejné a bez rizika: **přesunout hodnoty 1:1 do CSS třídy**. Desktop se nezmění, breakpoint konečně funguje. Kdybych místo toho sáhl po `!important` nebo mobilních klonech komponent, aplikace by dnes měla dvě sady komponent, které se rozejdou.

**Pořadí v CSS souboru rozhoduje.** Media query umístěná před základním pravidlem při stejné specificitě prohrává (R2), a `design-system.css` se importuje po `globals.css`, takže tam override v globals prohraje taky (R4). Proto sekce **RESPONSIVE OVERRIDES na konci** a komponentní styly u komponenty.

---

## Část 4: Otevřené rozhodnutí — brandové barvy

Ve **světlém** motivu propadají dvě barvy z Design Bible AA kontrastu:

| Token | Na bílé | Potřeba | Návrh |
|---|---|---|---|
| `--accent` `#0f9d6e` | 3.46 ❌ | 4.5 | `#0b7d57` (5.14) |
| `--danger` `#e5484d` | 3.91 ❌ | 4.5 | `#d13438` (4.93) |

Týká se to accentu **jako textu** (aktivní odkaz, „Vyřešit →"). Jako výplň tlačítka s bílým textem je v pořádku. V tmavém motivu obě projdou (7.20 / 5.54).

**Nesáhl jsem na ně.** Je to barva značky a její ztmavení je vidět na celém desktopu — to je tvoje rozhodnutí, ne moje. Hodnoty jsou připravené, změna je na dva řádky.

Druhá otevřená nabídka z R4: **sbalené hero jako výchozí stav na mobilu**. Hero + toolbar + stats zaberou na 375×812 asi 575 px, takže board začíná níž, než by bylo ideální. Hero už sbalitelné je (tlačítko „i"), šlo by jen změnit výchozí stav pro mobil. Je to změna výchozího chování, tak čekám na tvoje slovo.

---

## Stav
- `npm run lint`: **0/0**
- `npx vitest run`: **100/100**
- `npx playwright test`: **20/20**
- `npm run build`: **úspěšný**
- Reflow: **0 přetečení** na 320 / 375 / 768 / 1024 / 1440 napříč všemi stránkami

Responzivní etapa je hotová.

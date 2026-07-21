# ClearSpace — Responsive Audit (Fáze 1 dle RESPONSIVE_IMPLEMENTATION_AGENT.md)

**Bez implementace.** Audit proveden empiricky: reálné procházení aplikace v prohlížeči na **375×812 (mobil)** a **768×1024 (tablet)** + analýza stávajících breakpointů v CSS.

---

## Metodika a rozsah
Prošel jsem: Login/Registrace, Projekty (portál), Board (hero, toolbar, stats, kanban, karty), Kalendář, AI Studio, AI History, Tým, dialogy (AddCard), drawery (Task Detail, Project Intelligence).

## Co už funguje (nepředěláváme)
| Oblast | Stav |
|---|---|
| **Drawery** (Task Detail, Project Intelligence) | `≤768px` full-screen ✅ |
| **Tabulka Týmu** | `≤820px` se stackuje s `data-label` pseudo-hlavičkami ✅ (dobrý vzor) |
| **Kanban horizontální scroll** | funguje ✅ (Trello/Linear vzor — zachovat) |
| **Stats karty na mobilu** | stackují se (oprava z redesignu) ✅ |
| **AI Studio grids** | `auto-fit minmax()` se adaptují ✅ |
| **AI tabulky** | `overflow-x: auto` ✅ |
| **Login/Registrace na mobilu** | renderuje jen formulář, bez horizontálního přetečení ✅ *(ale není to explicitní pravidlo — viz Riziko R1)* |

**Stávající breakpointy:** pouze `max-width: 768px` (navbar, hero, toolbar margin, kalendář, drawer) a `max-width: 820px` (tým). **Žádný tablet breakpoint.**

---

## Inventář komponent

| Komponenta | Desktop | Tablet (768–1023) | Mobil (<768) | Akce |
|---|---|---|---|---|
| **Navbar** | ✅ | ✅ vejde se | ❌ odkazy ořezané („Projek…"), theme toggle stísněný | **Hamburger menu** |
| **Hero** | ✅ | ✅ | ⚠️ titulek 36px → 3 řádky, výška ~600px; info karty vedle sebe, druhá **oříznutá** | Titulek ≤32px, karty pod sebe, nižší výška |
| **Toolbar** | ✅ | ⚠️ láme se nesouměrně (3 řádky) | ❌ **„Nový úkol" mimo obrazovku** | Restrukturalizace (viz níže) |
| **Stats (MetricCard)** | ✅ | ⚠️ 4 v řadě, **text se překrývá** | ⚠️ 4×1 = velmi vysoké | **Grid 2×2** (tablet i mobil) |
| **Board / sloupce** | ✅ | ✅ | ⚠️ sloupec moc široký (vidět jen 1, chybí „peek") | Užší sloupec ~280px |
| **KanbanCard** | ✅ | ✅ | ✅ čitelná | Zvětšit touch cíle (delete 14px) |
| **Dialogy** (`.modal-content`: AddCard, AddColumn, MemberForm, AI modaly) | ✅ | ⚠️ | ❌ **přetéká mimo viewport** (doc scroll 433 > 375) | **Full-screen na mobilu** |
| **Drawery** (TaskDetail, PI) | ✅ | ✅ | ✅ | Jen touch cíle v mode-switcheru |
| **Projekty portál** | ✅ | ✅ | ⚠️ `minmax(320px)` + padding může přetéct | Snížit min na ~260px |
| **Kalendář** | ✅ | ⚠️ 7 sloupců stísněných | ❌ ~50px/den — nečitelné | Kompaktní měsíc + tečky (viz D3) |
| **AI Studio** | ✅ | ✅ | ✅ | Stats 2×2 |
| **AI History** | ✅ | ✅ | ✅ | — |
| **Tým** | ✅ | ✅ | ✅ | Touch cíle akcí |
| **Login / Registrace** | ✅ | ✅ | ✅ | Zexplicitnit skrytí brand panelu (R1) |

---

## Breakpoint strategie
- **Desktop ≥1024px** — referenční, **beze změny**
- **Tablet 768–1023px** — nový breakpoint (dnes chybí)
- **Mobil <768px** — rozšířit stávající

Sjednotit na `max-width: 1023px` (tablet a níž) a `max-width: 767px` (mobil), migrovat stávající `768/820` pravidla.

---

## Navrhovaná řešení (a proč)

**N1 — Navbar → hamburger (<768px).** Odkazy se dnes ořezávají. Vzor: Linear/Notion/GitHub Mobile — logo vlevo, hamburger vpravo, plnoplošné/slide-over menu. Obsah dle dokumentu: navigace (Board, Projekty, AI Studio, AI History, **Tým**) · akce (Project Intelligence, Nový úkol) · přepínač Board/Kalendář · Light/Dark + profil. *Pozn.: dokument uvádí „Týden" — v aplikaci je položka **Tým**; nepřejmenovávám (doc zakazuje).*

**N2 — Toolbar.** Přesunem PI + „Nový úkol" do hamburger menu (dle dokumentu) se toolbar odlehčí: mobil = **hledání (plná šířka) + Filtry + Řazení**, členy skrýt (doc). Tablet = jeden čistý řádek místo tří. Vzor: Asana/ClickUp.

**N3 — Stats 2×2.** Doc: „responsive grid, avoid horizontal scrolling". Řeší překryv na tabletu i výšku na mobilu.

**N4 — Hero.** Titulek ~28–30px (doc max 32), info karty pod sebe (dnes se druhá ořízne), nižší padding. Premium dojem zůstává.

**N5 — Kanban.** Neměnit. Jen užší sloupce na mobilu (~280px), aby byl vidět kus dalšího sloupce = signál „scrolluj". Vzor: Trello.

**N6 — Dialogy full-screen na mobilu.** Dnes přetékají. Full-screen (ne bottom-sheet), protože jde o **delší formuláře** (AddCard, AI generátory) — bottom-sheet se hodí pro krátké akce, ne pro multi-step formuláře. Vzor: Linear/Asana. Sticky hlavička + sticky patička s akcemi.

**N7 — Touch cíle ≥44×44px.** Ikonová tlačítka (smazat kartu, akce v tabulce, nav ikony) rozšířit hit-areou (padding), beze změny vizuálu na desktopu.

---

## Rizika / rozhodnutí pro tebe

- **R1 — Login brand panel.** Na mobilu se nezobrazuje, ale **žádné CSS pravidlo to nedělá** — chování je nechtěné/křehké. Navrhuji zexplicitnit (`display:none` pod 768px). *(Nezmění vzhled, jen zpevní.)*
- **R2 — Kalendář na mobilu — ROZHODNUTO:** varianta **(a) kompaktní měsíční mřížka s tečkami** místo textových chipů + klik na den rozbalí seznam úkolů daného dne. Zachová měsíční přehled; ověřený vzor (Google/Apple Calendar). *(Zvažované alternativy: horizontální scroll mřížky, agenda/seznam.)*
- **R3 — „Týden" vs „Tým"** v dokumentu — používám **Tým** (existující položka).

---

## Plán implementace (návrh pořadí)

| Fáze | Obsah |
|---|---|
| **R1** | Breakpoint foundation — sjednocení `1023/767`, migrace stávajících pravidel, responsivní spacing/typo tokeny. *Desktop beze změny.* |
| **R2** | **Tablet**: toolbar jeden řádek, stats 2×2, dialogy šířka, kalendář hustota |
| **R3** | **Mobilní navigace** — hamburger menu (největší kus) |
| **R4** | **Mobilní layout** — hero kompakt, toolbar, stats 2×2, šířka sloupců, karty |
| **R5** | **Dialogy a formuláře** — full-screen na mobilu, sticky header/footer |
| **R6** | **Kalendář na mobilu** (dle rozhodnutí R2) |
| **R7** | **Přístupnost + výkon** — touch cíle 44px, focus, kontrast, žádné duplicitní layouty, bundle |
| **R8** | **Finální polish + report** |

Po každé fázi: ověření na **375 / 768 / 1440**, `lint` + `unit` + `E2E` zeleně, review dokument.

## Zásady, které dodržím
Bez redesignu · bez přesouvání funkcí · bez přejmenování navigace · bez odebrání funkcí · **bez bottom navigation** · Kanban zůstává Kanbanem · **žádné separátní mobilní stránky ani duplicitní komponenty** (vše přes CSS + jednu komponentu).

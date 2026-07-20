# Project Intelligence — Product Concept Review

Produktová analýza (bez implementace). Role: Senior Product Designer (Linear / Raycast / Apple / Arc / Vercel).
Cíl: nahradit rostoucí seznam AI tlačítek jednou inteligentní vrstvou nad projektem. Přechod **feature-first → intelligence-first**.

---

## 1. Klíčový princip (co dělá, že to NENÍ chatbot)

Chatbot se otevře **prázdným vstupem**: „Na co se chceš zeptat?" — je k ničemu, dokud uživatel nenapíše.
Project Intelligence se otevře **hotovou analýzou**: „Tohle vidím. Tohle bych udělal." — má hodnotu při nula vstupu.

Jedno pravidlo, ze kterého plyne všechno ostatní:

> **Panel vede čtením (diagnóza), ne promptem (vstup). Chat je únikový východ dole, ne hrdina nahoře.**

Z toho se odvíjí i to, proč to působí, jako by AI „projekt už chvíli sleduje" — protože fakta jsou tam dřív, než cokoli napíšeš.

---

## 2. Narativ panelu: Diagnóza → Doporučení → Akce → Dotaz

Panel čte shora dolů jako briefing od chief-of-staff, ne jako dashboard s grafy.

### A. Pulse (zdraví) — jeden klidný signál, ne měřák
- Stavové slovo + **důvod**: `Vyžaduje pozornost — 3 blokátory, sprint na 90 %`.
- **Doporučuju NErobit vanity procenta** (falešně přesných „73 % zdraví" ubližuje důvěře). Radši `On track / Needs attention / At risk` + jednořádkové proč + malý trend („↓ od pondělí").

### B. Insights — konkrétní poznatky z aktuálního boardu
Nejdůležitější technické rozhodnutí celého konceptu:

> **Většina insightů je DETERMINISTICKÁ, ne od LLM.**

„3 blokované úkoly", „chybí odhady", „sprint kapacita 90 %", „žádný high-priority", „5 dní neaktivní", „moc úkolů v Review", „prázdný backlog" — to všechno jsou čisté datové dotazy nad boardem. LLM je jen **seřadí, pojmenuje a propojí**, nevymýšlí je.

Proč to takhle: důvěra = tvrdá fakta + AI vyprávění. Jeden generický/vymyšlený insight zabije důvěru v celý panel. (Pro QA/AI portfolio je tohle zlato — ukazuje, že víš, *kdy AI nepoužít*.)

### C. Suggested Actions — akce jako DŮSLEDEK insightu, ne statický seznam
Akce se nabízejí, **protože** něco v analýze platí:
- Prázdný backlog → „Vygenerovat úvodní úkoly"
- Sprint skoro plný → „Přeplánovat sprint"
- 3 blokátory → „Projít blokátory"
- Chybí odhady → „Odhadnout story points"

Tady se napojí stávající `/api/ai/*` funkce (Generate Tasks, Sprint Planner, Risk Analysis) — jen přestanou být tlačítka v liště a stanou se kontextovými doporučeními.

### D. Ask AI — chat, záměrně degradovaný dolů, vždy s kontextem projektu
`Zeptej se na cokoli o tomto projektu…`. Je to východisko pro to, co analýza nepokryla — ne hlavní interakce.

---

## 3. Bezpečnostní/důvěryhodnostní filozofie (portfolio angle)

- **AI navrhuje, člověk schvaluje.** Žádná akce nemění board sama — vždy vygeneruje **náhled/diff**, který uživatel potvrdí. (Sprint plán, reorganizace backlogu = návrh k ratifikaci.)
- **Deterministická fakta + AI narrace.** Panel je užitečný okamžitě (insighty se spočítají hned), AI text streamuje dovnitř. Nikdy spinner blokující celý panel.
- Tohle přesně sedí na cílovou roli (QA / AI-automation): odpovědná AI s human-in-the-loop.

---

## 4. Které AI akce mají největší hodnotu (žebříček hodnota/důvěra)

| Akce | Hodnota | Pozn. |
|---|---|---|
| Projít blokátory (deterministické najití + AI proč/co dál) | Vysoká | Přímý důsledek insightu |
| Prioritizovat backlog (AI přeřadí s odůvodněním) | Vysoká | Klasický pain point |
| Naplánovat sprint (respektuje kapacitu) | Vysoká | Už existuje, jen zasadit |
| Odhadnout story points | Střední-vysoká | Napojení na „chybí odhady" |
| Vygenerovat chybějící úkoly z cíle | Vysoká (signature) | Už existuje |
| **Najít závislosti** (graf mezi úkoly) | Signature / wow | Novum, působivé do portfolia |
| Generovat dokumentaci / roadmapu | Střední (signature) | Later |
| Vylepšit popisy úkolů | Nízká-střední | Marginální, až nakonec |

**MVP action set:** tři stávající funkce (přerámované) + „Projít blokátory" + „Prioritizovat backlog" — protože přímo konzumují insighty. Závislosti + dokumentace jako pozdější signature featury.

---

## 5. Varianty UX (a doporučení)

**V1 — Pravý glass slide-over panel** (tvůj návrh). Sekce nad sebou, chat dole.
+ klidný, prostorný, přesně Linear right-panel. − bere horizontální místo na malých displejích.

**V2 — Command palette (Raycast, ⌘K, centr modal).** Insighty + akce jako filtrovatelný seznam, píšeš pro filtr/dotaz.
+ bleskové, power-user, extensible. − málo místa pro „zdraví", je efemérní (zavře se po akci) → míň „živý mozek".

**V3 — Ambientní chip + panel (hybrid).** V toolbaru/heru žije **klidný pulse chip** (`On track` / `3 blokátory`), který JE spouštěč. Klik rozbalí V1 panel.
+ inteligence je vidět **pořád** (nejčistší intelligence-first), vstupní bod sám nese signál, nejprémiovější. − víc designu, pozor ať „nenaguje".

### Doporučení: **V3 → V1**
Ambientní pulse chip jako spouštěč, který otevře pravý glass slide-over. Nejlepší z obojího: **tlačítko samo je inteligentní** (žije, ukazuje puls, ne statický label), a klik otevře bohatý klidný panel. Klávesová zkratka **⌘ I** (Intelligence) otevře ten samý panel — Raycast/Linear signál kvality.
Fallback, kdyby chip nagoval: degradovat na obyčejný `✨ Project Intelligence` label.

---

## 6. Otevření / zavření

- **Spouštěč:** pulse chip v toolbaru **+** zkratka `⌘ I`.
- **Panel:** pravý slide-over ~400 px, glass, **overlay s jemným scrimem** (board zůstane vidět/ztlumený → pořád vidíš to, o čem panel mluví). Overlay je klidnější a míň layout-práce než push.
- **Zavření:** `Esc`, klik do scrimu, `×`, nebo znovu `⌘ I`. Rychlý glance-and-dismiss.
- **Scope:** per-projekt (Project Intelligence). Později Workspace Intelligence o úroveň výš.

---

## 7. Rozšiřitelnost bez nových tlačítek (architektonický payoff)

Panel = **registr schopností**. Každá schopnost = `{ analyzer(board) → insights[], actions[] }`.
- Přidání nové AI dovednosti = zaregistruju nový analyzer/akci → automaticky se propíše do Insights/Actions.
- **Toolbar má jedno tlačítko navždy.** Nikdy víc.
- Akce jsou data-driven: `{ id, label, icon, when(board)→bool, run() }`. Nová dovednost = nový záznam, ne nový button.

Tohle je i lepší příběh do STORY.md: *„Nejdřív jsme AI akce zpřehlednili, pak z nich udělali vrstvu, která projektu rozumí."*

---

## 8. Rizika / tradeoffy (poctivě)

- **Kvalita insightů je všechno.** Jeden generický insight zabije důvěru → start deterministicky.
- **Latence.** Panel musí být užitečný okamžitě (deterministické insighty ihned), AI narrace streamuje. Nikdy blokující spinner.
- **Prázdný/nový projekt.** Grácie: „Čerstvý projekt — vygenerovat úvodní backlog?"
- **Cena.** Nevolat LLM při každém otevření — cache, LLM jen na narraci/akce.
- **Nenagovat.** Chip musí být klidný (jedno slovo/tečka), ne notifikační ping.

---

## 9. Vize 2–3 roky: Clearspace jako „projekt, který přemýšlí"

- **Kontinuální, ne on-demand** — panel sleduje a proaktivně (jemně) upozorní: „Sprint se posunul, 2 úkoly teď v riziku."
- **Workspace / Portfolio Intelligence** — roll-up zdraví přes všechny projekty, kapacita týmu.
- **Agentní s brzdami** — nejen navrhuje, ale **nadraftuje** celý plán (sprint, reorg backlogu) jako návrh k jednomu kliknutí. AI navrhuje, člověk ratifikuje.
- **Paměť a narativ** — zná historii, odpoví „co se změnilo tento týden", generuje standupy/retra.
- **Odlišující prvek:** konkurence nalepuje chatboty zvenčí; Clearspace má inteligenci **nativní a klidnou**. Board je tělo, Project Intelligence je mysl.

**Jedna věta pozičního claimu:** *Clearspace není kanban s AI funkcemi — je to projekt, který sám sobě rozumí.*

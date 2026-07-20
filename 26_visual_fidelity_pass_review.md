# Review - Visual Implementation Pass (věrné převedení návrhů)

Cíl: co nejvěrněji převést cílové návrhy (Dark + Light) do aplikace při zachování veškeré funkcionality. Theme System, logika, workflow, IA, DnD ani datový model se neměnily -- pouze vizuální vrstva.

## Co bylo implementováno

- **Hero -- letecký oceán/ostrov:** doplněn artwork oceánu na pravé straně hero sekce s jemným "veil" přechodem ke straně s nadpisem (text zůstává čitelný). Laděno pro oba motivy: **dark = tlumený teal oceán**, **light = vzdušná tyrkysová voda**. Kompozice (nadpis vlevo, artwork vpravo, glass karty vpravo nahoře) odpovídá návrhům.
- **Hero glass karty:** dvě samostatné plovoucí skleněné karty (`THIS WEEK` / `FOCUS NOTE`) s `backdrop-blur`, jemným borderem a teal akcentem na první kartě -- dle návrhu.
- **Statistické karty:** přestylovány přesně podle návrhu -- ikona v zaobleném teal-tintovaném čtverci vlevo, popisek + velké číslo, kruhové tlačítko s šipkou (`>`) vpravo. Odstraněn barevný levý proužek.
- **Toolbar -- hierarchie tlačítek:** `Generate Tasks` a `Nový úkol` plné teal, `AI Sprint Planner` a `AI Risk Analysis` ghost/outline -- odpovídá návrhu.
- **Barvy / materiál:** teal akcent, glass povrchy, sjednocené radiusy, stíny a typografie přes existující design tokeny. Dark i light konzistentní.
- **Zachováno beze změny:** Drag & Drop, AI Studio, AI History, Sprint Planner, Risk Analysis, Workspace, Projects, Multi Assignee, všechny modaly, navigace, informační architektura, komponentová architektura, datový model i logika Theme Systému.

## Co nebylo možné implementovat 1:1 (a proč)

- **Přesná fotografie ostrova z návrhu.** V návrzích je konkrétní letecká fotografie tropického ostrova. Tu jsem **nereprodukoval jako fotku**, ale jako vlastní vektorový artwork (`public/hero-ocean.svg`) -- tyrkysová voda, laguna a náznak ostrova s rozostřením.
  - **Proč:** exaktní fotografie nebyla dodána jako asset; zároveň jsem záměrně (a) nevyužil placenou generaci obrázků na tvém účtu bez tvého svolení a (b) nevkládal nelicencovanou stock fotku do produkčního projektu. Vektorový artwork je zdarma, licenčně čistý, malý a rozlišením nezávislý.
  - **Dopad:** kompozice, atmosféra, barvy a glass efekt odpovídají návrhu odhadem z ~85-90 %, ale nejde o fotografický detail. Dark varianta je o něco abstraktnější/tmavší než fotografická předloha.
  - **Jak dosáhnout 100 %:** dodej konkrétní fotografii (nebo potvrď generaci obrázku) a vyměním `public/hero-ocean.svg` za fotku -- zbytek (overlay, glass karty, pozice) je připravený a bude fungovat beze změny.

## Výsledky

- **Testy:** `npx vitest run` -> 92/92 v 17 souborech.
- **Lint:** `npm run lint` -> 0 chyb, 0 varování.
- **Build:** `npm run build` -> úspěšný (14/14 stránek).
- **Vizuální ověření:** hero, toolbar, statistiky, board i karty ověřeny v prohlížeči v dark i light režimu.

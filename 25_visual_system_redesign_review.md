# Review Release 24 - Visual System Redesign

Kompletní redesign vizuální vrstvy před 1.0 + plnohodnotný Theme System (Light / Dark / System). Evoluce, ne přepis: logika, workflow, informační architektura a datový model zůstávají beze změny. Přístup byl **token-first** -- veškeré barvy jdou přes centralizovaný design systém, ne přes lokální hodnoty v komponentách.

---

## A. Jaké UX principy byly převzaty (a od koho)

Z inspirací (dark teal glass + light airy) i z referencí (Linear, Vercel, Attio, Notion, Raycast) jsem převzal principy, ne vzhled:

- **Jeden výrazný akcent, zbytek neutrální** (Linear/Vercel): sjednoceno na teal. Dřívější dvojice modrá + fialová se slévala; jeden akcent dává čistší hierarchii a "produktový" pocit.
- **Tiché povrchy, mluví obsah** (Notion/Attio): tlumené surface tokeny, jemné borders, důraz nesou nadpisy a akcenty, ne rámečky.
- **Elevace světlem, ne čárami** (Raycast/Linear dark): v dark módu jemný `--shadow-glow` a vrstvené surface místo tvrdých ohraničení.
- **Ostré přepnutí motivu** (Vercel): přepnutí je okamžité, tranzice se během přepnutí potlačí -> žádný "crossfade" flicker.
- **Sklo na plovoucích prvcích** (Arc/Granola): toolbar je `backdrop-filter` glass panel, tokenizovaný pro oba motivy.

Vědomě jsem se odchýlil od 1:1 kopie: layout a informační architektura původní aplikace jsou už dobré (hero + toolbar + stats + board), takže jsem je **neměnil strukturálně** -- redesign je v barvě, materiálu, elevaci, radiusu a konzistenci, ne v přeskládání obrazovek. To je pro produkt bezpečnější a pro uživatele méně matoucí.

## B. Theme System

- Nový `contexts/ThemeContext.tsx`: volby **Light / Dark / System**, okamžité přepínání, preference uložená v `localStorage` (`clearspace-theme`).
- **Bez bliknutí (FOUC):** inline no-flash skript v `<head>` nastaví `data-theme` na `<html>` ještě před prvním vykreslením.
- **System mód** reaguje živě na změnu systémového nastavení (`matchMedia('prefers-color-scheme')`).
- Přepínač v Navbaru = segmentovaný control (Slunce / Monitor / Měsíc), tokenizovaný, s aktivním stavem.
- Přepnutí je "ostré": během změny se přidá třída `theme-switching`, která vypne tranzice, takže barvy neanimují jedna přes druhou.

## C. Nové design tokeny

Centralizované v `globals.css` (`:root`/`[data-theme="light"]` + `[data-theme="dark"]`):

- **Barvy:** `--accent`, `--accent-hover`, `--accent-soft`, `--accent-ring`, `--text-on-accent`, `--accent-yellow`.
- **Povrchy:** `--bg-page`, `--surface`, `--surface-2`, `--surface-3`, `--surface-glass`, `--overlay`.
- **Borders:** `--border`, `--border-strong`.
- **Text:** `--text`, `--text-secondary`, `--text-muted`.
- **Stavy:** `--success/-soft`, `--warning/-soft`, `--danger/-soft`.
- **Elevace:** `--shadow-sm/-md/-lg`, `--shadow-glow`.
- **Radius:** `--radius-sm/(base)/-md/-lg/-xl/-full`.
- **Legacy aliasy:** staré názvy (`--dark-navy`, `--gray-text`, `--blue-primary`, `--purple-secondary`, `--bg-card`, `--bg-column`, `--border-color`) jsou **namapované na nové tokeny**, takže stovky existujících `var(--...)` použití se motivují automaticky, bez nutnosti přepsat každou komponentu.

## D. Provedené změny (a proč)

1. **Akcent modrá+fialová → teal.** Jednotný akcent = čistší hierarchie, prémiovější dojem, méně "template".
2. **Plný token systém + dark/light.** Aplikace byla dřív jen light s natvrdo zadanými barvami (R20 dark mode dokonce mazal). Teď je vše řízené tokeny.
3. **globals.css: 90 natvrdo zadaných hex → tokeny** (pozadí → surface, danger červené → danger, off-white → surface-2, akcenty → accent). 0 zbylých netokenových hex ve stylech.
4. **Komponenty: sweep inline hex → tokeny** (23 souborů). Bezpečné, sémanticky jednoznačné barvy (pozadí, danger, značkové odstíny) namapovány na tokeny.
5. **Toolbar glass tokenizovaný** (`--surface-glass`) -- dřív natvrdo `rgba(255,255,255,.9)`, což by v dark módu svítilo bíle.
6. **Radius a elevace sjednoceny** přes tokeny (konzistentní zaoblení a stíny napříč cards/modals/buttons/inputs).
7. **Responsive refinements** pro mobil (navbar se scrollovatelnou navigací, zmenší hero, kompaktní toolbar).

## E. Nové komponenty / soubory

- `frontend/src/contexts/ThemeContext.tsx` -- ThemeProvider, `useTheme`, no-flash skript.
- Navbar: interní `ThemeToggle` (segmentovaný přepínač motivu).

## F. Upravené komponenty

- `globals.css` -- token systém (light+dark), konverze hex→tokeny, `.theme-toggle*`, potlačení tranzic při přepnutí, mobilní media query.
- `app/layout.tsx` -- `ThemeProvider`, no-flash skript v `<head>`, aktualizovaná metadata.
- `components/layout/Navbar.tsx` -- přepínač motivu, tokenizované barvy dropdownu/logoutu, teal akcent podtržení.
- **23 komponent** (board, toolbar, stats, kanban card, drawer, modaly, member selecty, auth, dashboard) -- inline barvy → tokeny.
- Paleta barev avatarů v `WorkspaceMembersModal` obnovena na konkrétní odstíny (avatary jsou barevné nezávisle na motivu).

## G. Design system (sjednoceno)

Radius, spacing, typografie (Playfair pro hero display + Inter pro UI), shadows/elevation, colors, ikony (lucide), buttons, inputs, cards, dialogy, badges, avatary, kanban cards i statistiky nyní čerpají ze společných tokenů. Žádná komponenta nedefinuje vlastní paletu (kromě záměrné palety avatarů a datových sérií v AI grafech).

## H. Responsive

- **Desktop:** plný layout, ověřeno (light i dark).
- **Tablet:** plynulé zúžení (flex/wrap), sdílené tokeny.
- **Mobile (375px):** navbar se scrollovatelnou navigací + viditelný přepínač a avatar, stackovaný hero, horizontálně scrollovatelné stats i board, čitelné karty. Ověřeno v dark módu.
- Známé omezení: plná mobilní navigace (hamburger) je kandidát na samostatný pass; současný stav je funkční a čitelný.

## I. Dark mode / Light mode

- **Light:** teplá off-white plocha, bílé surface, teal akcent, jemné stíny -- vzdušný, čistý.
- **Dark:** hluboká teal-black plocha, vrstvené tmavé surface, jasně teal akcent, jemný glow -- prémiový "glass" dojem.
- Oba ověřeny v prohlížeči na boardu, toolbaru, statistikách, kanban kartách i modálech. Přepínání okamžité, preference se ukládá (ověřeno: `localStorage clearspace-theme` + `data-theme` na `<html>`).

## J. Kompatibilita

Redesign je čistě vizuální (barvy/materiál/rozestupy přes tokeny) -- nedotýká se logiky. Drag & Drop, AI Studio, AI History, Sprint Planner, Risk Analysis, Workspace, Projects, Multi Assignee i všechny modaly fungují beze změny; potvrzeno celou testovací sadou a produkčním buildem (routes všech funkcí).

## K. Výsledek testů

- `npx vitest run`: **92/92 testů prošlo v 17 souborech.** (ThemeContext má bezpečnou výchozí hodnotu, takže `useTheme` funguje i v testovém podstromu bez provideru.)

## L. Výsledek lint

- `npm run lint`: **0 chyb, 0 varování.**

## M. Výsledek build

- `npm run build`: **úspěšný** (Compiled successfully, 14/14 stránek).

## N. Kritické zhodnocení

Návrhy jsem bral jako inspiraci, ne blueprint. Nejlepší UX rozhodnutí bylo **nezasahovat do informační architektury** -- redesign těží z konzistence a materiálu, ne z přeskládání. Token-first přístup navíc znamená, že budoucí ladění (nový akcent, nové stíny) je změna na jednom místě, ne hon po komponentách. Dluh k doladění: pár AI grafů si drží vlastní paletu datových sérií (záměrně, aby zůstaly rozlišitelné) a mobilní navigace by si zasloužila dedikovaný pass -- obojí je bezpečně izolované a neblokuje 1.0.

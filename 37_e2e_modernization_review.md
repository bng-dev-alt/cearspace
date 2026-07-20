# Review — Modernizace E2E (Playwright)

E2E sada v `e2e/kanban.spec.ts` byla **kompletně zastaralá** (předcházela R21+): čekala `h1 = "Kanban Board"`, anglické sloupce „To Do/In Progress…", žádný login a starou routu `/`. Proti současné appce **neběžela**. Přepsáno na reálné toky + přidáno pokrytí flagship featury.

## Co bylo špatně
- Aplikace má dnes: mock auth (login gate), českou UI, clearspace branding, projektové routování (`/projects/project-default`), redesign. Starý spec nic z toho nereflektoval.

## Co je teď pokryto (6 scénářů, všechny zeleně)
1. **Render boardu** — české sloupce (Nápady, Naplánováno, V průběhu, K revizi, Hotovo) + správné počty karet.
2. **Přidání karty** — modal „Přidat kartu do: Nápady", vyplnění, submit, karta se objeví, počet naskočí.
3. **Přejmenování sloupce** — inline edit + Enter.
4. **Drag & drop** karty mezi sloupci — přesun + kontrola počtů i cílového seznamu.
5. **Project Intelligence** — pulse chip má tečku, panel otevře, ukazuje deterministický insight („blokovaný úkol" z demo dat), zdraví i doporučené akce.
6. **Zkratka ⌘I / Ctrl+I** otevře panel.

## Řešené výzvy (QA detaily)
- **Auth v demo režimu:** session se seeduje přes `page.addInitScript` (`kanban_mock_session` + profil) → obejde login gate deterministicky; board se sám naseeduje z `INITIAL_COLUMNS`. Každý test = čistý kontext.
- **Nativní HTML5 drag&drop:** Playwrightův `dragTo()` nespouští `dragstart`/`drop` spolehlivě. Vyřešeno **dispatchem sekvence DnD eventů se sdíleným `DataTransfer`** (`dragstart → dragenter → dragover → drop → dragend`). Funguje, protože drop čte kartu z Reactího ref nastaveného v `dragstart`.

## Soubory
- `e2e/kanban.spec.ts` — přepsáno na aktuální appku + Project Intelligence.
- `package.json` — přidán skript `test:e2e` (`playwright test`).
- (`playwright.config.ts` beze změny — webServer `npm run dev` na :3000, chromium.)

## Spuštění
```
npm run test:e2e
```
Pozn.: Playwright si spouští vlastní dev server na :3000, takže před během nesmí běžet jiný `next dev` pro tento projekt (Next 16 odmítá druhou instanci).

## Výsledky
- `npm run lint`: **0/0**
- `npx vitest run`: **96/96**
- `npm run test:e2e`: **6/6** (chromium)

## Mimo tento krok
CI workflow (GitHub Actions) pro lint + unit + e2e; multi-browser (webkit/firefox); vizuální/regresní snapshoty.

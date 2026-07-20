# Review Release 25 - Quality & Finish

Stabilizační/lešticí release před Portfolio 1.0. Žádné nové funkce, žádný přepis architektury -- pouze audit, čištění, výkon a doladění UX.

---

## A. Nalezené problémy (audit)

- **Dead code / nepoužívané soubory:** `EditCardModal.tsx` (nahrazen `TaskDetailDrawer`, nikde neimportován) a 5 výchozích Next starter SVG v `public/` (`next/vercel/globe/window/file.svg`) -- nepoužité.
- **`console.log` v produkci:** `aiService.ts` logoval každý AI request bez podmínky.
- **Placeholder UI:** tlačítko ozubeného kola v Toolbaru volalo `alert('Nastavení: UI konfigurace layoutu')` -- nefunkční stub.
- **Duplicitní logika:** odvození iniciál z jména bylo trojmo (Navbar, WorkspaceMembersModal, `deriveInitials`).
- **Chybějící přístupný focus:** buttony neměly konzistentní focus ring pro klávesnici.
- **Bundle:** těžké AI modaly (Generate Tasks/Sprint/Risk/Project) se načítaly staticky, i když se otevírají zřídka.
- **Známé omezení (neopravováno záměrně):** statistiky rozlišují sloupce podle názvu (`name === 'V průběhu'`) s fallbackem na pozici id -- viz sekce F.

## B. Provedené opravy

- Odstraněn `EditCardModal.tsx` a 5 nepoužitých SVG.
- `console.log` v `aiService.ts` obalen podmínkou `NODE_ENV !== 'production'` (čisté produkční logy, zachovaná dev observabilita).
- Tlačítko nastavení: odstraněn `alert`, nyní `disabled` s tooltipem „Nastavení (připravujeme)" + `aria-label` (zachováno vizuálně kvůli parity s návrhem, ale bez klamavé akce).
- Deduplikace: `Navbar` i `WorkspaceMembersModal` nově používají sdílený `deriveInitials`; smazány dvě lokální kopie.

## C. Optimalizace (výkon)

- **Lazy loading (code splitting):** `GenerateTasksModal`, `GenerateSprintModal`, `RiskAnalysisModal` (board) a `GenerateProjectModal` (dashboard) přes `next/dynamic({ ssr: false })` -- JS těchto modalů se stáhne až při prvním otevření, ne v initial bundlu. Ověřeno, že se modaly otevírají korektně bez chyb.
- **Memoizace:** `StatsRow` obalen `React.memo` (čistě prop-driven komponenta, přestává se re-renderovat při nesouvisejících změnách boardu). `KanbanCard` byl memoizován už dříve.

## D. Odstraněný dead code

| Soubor | Důvod |
|---|---|
| `src/components/EditCardModal.tsx` | nahrazen TaskDetailDrawer, neimportován |
| `public/next.svg` · `vercel.svg` · `globe.svg` · `window.svg` · `file.svg` | výchozí Next assety, nepoužité |
| lokální `getInitials` v `Navbar` | duplicita `deriveInitials` |
| inline odvození iniciál v `WorkspaceMembersModal` | duplicita `deriveInitials` |
| stub `alert()` u tlačítka nastavení | nefunkční placeholder |

## E. UX doladění

- **Focus states:** přidán globální přístupný `:focus-visible` ring (accent barva, 2px, offset) -- konzistentní klávesová navigace napříč buttony/inputy/odkazy, aniž by rušil ovládání myší.
- **Loading/empty states:** ověřeny a ponechány -- Projects (`Načítání projektů...` / „Zatím nemáte žádné projekty…"), AI History (prázdný stav), Board se hydratuje z localStorage bez prázdného bliknutí.
- **Dialogy:** destruktivní akce používají potvrzení; nefunkční stub odstraněn.
- **Konzistence:** tlačítka Toolbaru sjednocena do tříd (`toolbar-btn` / `-primary` / `-ghost`) místo roztroušených inline stylů.

## F. Co bylo ponecháno (a proč)

- **Name-based klasifikace statistik** (`c.name === 'V průběhu' || c.id.endsWith('column-3')`): má fallback na pozici id, takže funguje pro výchozí boardy. Robustnější řešení (explicitní typ sloupce v datovém modelu) je změna modelu + migrace -- mimo rozsah „neměň architekturu". Ponecháno jako známé omezení.
- **Nativní `confirm()` u destruktivních akcí** a pár chybových `alert()` v ojedinělých error cestách: funkční a bezpečné; náhrada za vlastní toast systém by byla nová funkce -- mimo rozsah tohoto releasu.

## G. Výkon

- Menší initial JS boardu i dashboardu (4 modaly odsunuty do samostatných chunků).
- Méně zbytečných re-renderů statistického řádku (`React.memo`).
- Žádná regrese: modaly, DnD, AI funkce i téma ověřeny.

## H. Validace hlavních částí

Ověřeno (dev, demo režim): **Board** (render, karty, sloupce), **Theme** (light/dark/system, okamžité přepnutí), **AI modaly** (Sprint Planner otevřen z lazy chunku bez chyby), toolbar, statistiky, hero. Konzole bez chyb. Board/Projects/AI Studio/AI History/Workspace/Drag & Drop/Sprint Planner/Risk Analysis dále kryty automatizovanou sadou.

## I. Výsledek lint

- `npm run lint`: **0 chyb, 0 varování.**

## J. Výsledek build

- `npm run build`: **úspěšný** (Compiled + TypeScript finished, 14/14 stránek), s novými samostatnými chunky pro lazy modaly.

## K. Výsledek testů

- `npx vitest run`: **92/92 testů prošlo v 17 souborech.**

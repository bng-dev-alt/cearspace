# Design Bible — Fáze 1: Znovupoužitelné primitivy

Postavení sdílené vrstvy design systému (CSS třídy `.cs-*` + React primitivy), ze které se skládají obrazovky ve fázích 2–7. Konzumuje tokeny z Fáze 0. **Žádná změna UX/funkce** — jen přidána knihovna a pilotně nasazena na StatsRow.

## Co bylo vytvořeno

### CSS vrstva — `src/app/design-system.css` (nový, importovaný v layoutu)
Sdílené třídy s prefixem `.cs-*` (aby nekolidovaly se stávajícími styly):
- **Buttons** `.cs-btn` + varianty `--primary/--secondary/--ghost/--danger`, velikosti `--sm/--lg`, `--block`. Emerald primary, focus ring, hover lift.
- **Card** `.cs-card` (glass surface, radius-card, shadow), `--interactive`.
- **Fields** `.cs-label`, `.cs-input` (+ textarea), emerald focus ring.
- **Badge/chip** `.cs-badge` + `--accent/--danger/--success/--warning`.
- **MetricCard** `.cs-metric` (ikona + label + velké číslo + trend/akce), `--interactive`, `.cs-metric-action`.
- **Empty state** `.cs-empty` (vizuál + serif titulek + popis).
- **Table** `.cs-table` (premium řádky, hover, uppercase hlavičky).
- **Modal shell** `.cs-modal-overlay` + `.cs-modal` (glass dialog, header, close) + animace (`prefers-reduced-motion` respektováno).

### React primitivy — `src/components/ui/`
Tenké obaly nad `.cs-*` (kompozice + typová bezpečnost):
- `Button` (variant/size/block), `MetricCard` (icon/label/value/danger/trend/action/onClick), `EmptyState` (icon/title/description/action), `ModalShell` (isOpen/onClose/title/icon + Esc a overlay close), `Badge` (variant). Barrel `index.ts`.

### Pilot adopce — `StatsRow`
StatsRow přepsán na `<MetricCard>` (4 dlaždice). Ověřeno Dark i Light: **vizuálně i funkčně identické** (emerald ikony, „Vyřešit →" mikro-akce na Blokováno otevírá Project Intelligence). Stejná `MetricCard` poslouží AI Studiu a History (Fáze 5).

## Změněné / nové soubory
- `src/app/design-system.css` — **nový**, primitivní CSS vrstva.
- `src/app/layout.tsx` — import `design-system.css`.
- `src/components/ui/Button.tsx | MetricCard.tsx | EmptyState.tsx | ModalShell.tsx | Badge.tsx | index.ts` — **nové**.
- `src/components/toolbar/StatsRow.tsx` — refactor na MetricCard (pilot).

## Důležitá rozhodnutí
- **CSS-first + tenké React obaly.** Většina stylů v `.cs-*` třídách (konzistentní se stávajícím className-based kódem, minimální overhead), React komponenty jen tam, kde pomáhá kompozice. Maximalizuje reuse a usnadní adopci v dalších fázích.
- **Samostatný `design-system.css`** (modulární) importovaný po globals — čitelnější než přidávat do obřího globals.
- **Pilot na StatsRow** — nízké riziko, prokazuje pattern; `.app-stats-row` kontejner zachován, `flex:1` přes `style` prop, aby `.cs-metric` zůstal generický.

## Odchylky od Design Bible
- Žádné. Stará `.stat-card` CSS je nyní StatsRow nepoužívaná (ponechána, neškodí; uklidí se ve finálním sweepu Fáze 7).

## Ověření
- StatsRow (MetricCard) **Dark i Light** v prohlížeči — identické, funkce (Vyřešit → PI) zachována.
- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npm run build`: **úspěšný**.

## Dál (Fáze 2)
Login / Registrace: editorial levý panel (organic vrstvy, ambient light), plovoucí glass auth karta, adopce `Button`/`.cs-input`/`.cs-label`.

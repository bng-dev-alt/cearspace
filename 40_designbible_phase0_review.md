# Design Bible — Fáze 0: Token foundation

První fáze kompletního vizuálního redesignu dle `ClearSpace_Design_Bible_v1.0.md`. Zavedení základu design systému (tokeny + typografie). **Žádná obrazovka nebyla restrukturalizována** — mění se jen token vrstva, která se propíše globálně.

## Co bylo upraveno

### Barvy — akcent na muted emerald (Design Bible)
- Light `--accent: #0f9d6e` (hover `#0b8459`), Dark `--accent: #34c98a` (hover `#5cd7a4`) + `--accent-soft` / `--accent-ring` / `--shadow-glow` sladěné do emeraldu.
- Posun z teal (`#0d9488`/`#2dd4bf`). Legacy aliasy `--blue-primary` / `--purple-secondary` → `--accent`, takže se emerald propsal i do komponent, které je používaly.

### Typografie — Fraunces (editorial serif)
- **Playfair `@import` z Google Fonts nahrazen Fraunces přes `next/font`** (self-hosted, bez layout shiftu, funguje s CSP, není render-blocking).
- Nový token `--font-serif: var(--font-serif-next), Georgia, serif`. Všechny výskyty `'Playfair Display', Georgia, serif` (globals + login/register) → `var(--font-serif)`.
- Body zůstává **Sora** (dle rozhodnutí).

### Radius — Bible scale
- Sémantické tokeny: `--radius-button: 14px`, `--radius-card: 18px`, `--radius-dialog: 24px`, `--radius-hero: 28px`.
- Generická scale nudgnuta k Bible (sm 8, base 12, md 14, lg 18, xl 24, +2xl 28).

### Glass — jemnější (Bible 90–95 %)
- `--glass-bg` opacity z ~52–66 % na **90–92 %**, blur z 16px na **10px** (jemnější), přidán `--glass-border` (tenký highlight) light i dark.

### Motion tokeny
- `--dur-fast: 150ms`, `--dur-base: 220ms`, `--ease-out`, `--transition-base` (Bible: 150–250 ms ease-out). Připraveno pro další fáze; `--spring-transition` ponechán.

## Změněné soubory
- `src/app/layout.tsx` — Fraunces přes `next/font` (`--font-serif-next`).
- `src/app/globals.css` — emerald tokeny (light+dark), glass, radius, motion, `--font-serif`, odstraněn Playfair `@import`, náhrada serif referencí.
- `src/app/login/page.tsx`, `src/app/register/page.tsx` — inline Playfair → `var(--font-serif)`.

## Důležitá rozhodnutí
- **Fraunces místo Playfair** — zároveň opraven anti-pattern externího `@import` (render-blocking). Lepší než v Bibli navržený Playfair (rozhodnuto s uživatelem).
- **Radius: nudge generické scale + sémantické tokeny** — komponenty adoptují sémantické tokeny (button/card/dialog/hero) v dalších fázích; nudge zajistí okamžitou konzistenci.

## Odchylky od Design Bible
- **`--success` je také z emerald rodiny** (light `#0d9f6e`), takže se s emerald akcentem barevně překrývá. Zatím ponecháno (běžné v design systémech). Sleduji — pokud bude v nějakém kontextu matoucí (akce vs. success), odliším v pozdější fázi.
- **Settings**: mimo scope (obrazovka neexistuje) — dle rozhodnutí, zaznamenáno.

## Ověření
- Board **Dark i Light** v prohlížeči: emerald akcent (tlačítka, ikony, „Board" underline, pulse dot, odkazy), Fraunces hero nadpis, jemnější glass, zaoblenější rohy. Layout a funkce beze změny.
- Login (bez přihlášení) Dark: emerald CTA, Fraunces nadpisy.
- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npm run build`: **úspěšný** (Fraunces se stáhla).

## Dál (Fáze 1)
Znovupoužitelné primitivy: `Button`, `Input`, `Select`, `Card`, `MetricCard`, `ModalShell`, `Toast`, `EmptyState`, `Badge`, `Table`, `ChartFrame` — z nich se skládají obrazovky ve fázích 2–7.

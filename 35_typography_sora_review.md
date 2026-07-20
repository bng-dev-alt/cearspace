# Review — Typografie: Sora pro UI + oprava latentního font bugu

Změna těla/UI fontu na **Sora**, hero serif nadpisy beze změny. Cestou odhalen a opraven letitý bug, kvůli kterému se `--font-sans` nikdy reálně neaplikoval.

## Změna fontu
- **Tělo / UI / karty → Sora** (moderní geometrický grotesk), přes `next/font/google` se `subsets: ['latin', 'latin-ext']` (české znaky ř/ů/ě).
- **Hero nadpisy zůstávají serif** (`'Playfair Display', Georgia, serif`) — beze změny, dle přání.

## Opravený bug (root cause)
`globals.css` měl:
```css
--font-sans: var(--font-sans), system-ui, ...;
```
`--font-sans` odkazoval **sám na sebe** → cyklická custom property → CSS ji vyhodnotí jako neplatnou (prázdnou) → `body { font-family: var(--font-sans) }` padalo na výchozí **Times** (serif). Font (dřív Inter, teď Sora) se tak nikdy neaplikoval na tělo.

**Oprava (čistě, bez self-reference):**
- `next/font` nově plní surovou proměnnou `--font-sans-next`.
- `globals.css` z ní skládá stack: `--font-sans: var(--font-sans-next), system-ui, -apple-system, ...;`

Ověřeno v prohlížeči (computed styles):
- `--font-sans` = `"Sora", "Sora Fallback", system-ui, ...`
- `body` font = Sora
- `h1` (hero) = `"Playfair Display", Georgia, serif` (nedotčeno)

## Upravené soubory
- `app/layout.tsx` — `Inter` → `Sora`, proměnná `--font-sans-next`, `latin-ext`.
- `app/globals.css` — řádek 77: odstraněna self-reference, skládání z `--font-sans-next`.

## Výsledky
- `npm run lint`: **0/0**
- `npx vitest run`: **96/96**
- `npm run build`: **úspěšný**

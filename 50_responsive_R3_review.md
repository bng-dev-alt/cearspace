# Responsive R3 — Mobilní navigace (hamburger)

Třetí fáze. Cíl: použitelná navigace pod 768 px a odstranění vodorovného přetékání. **Desktop i tablet ověřeně beze změny.**

## Co bylo uděláno

### Jeden Navbar, žádná duplicitní komponenta
Rozšířil jsem stávající `Navbar` místo vytváření `MobileNavbar`. Klíčové rozhodnutí: **jedno pole `navItems` napájí desktopovou lištu i mobilní menu** — položky nemůžou rozejít.

Board-specifické akce se předávají **volitelným** propem, takže ostatní stránky volají `<Navbar />` beze změny:

```ts
export interface NavbarBoardActions {
  onOpenIntelligence: () => void;
  onNewTask: () => void;
  viewMode: 'board' | 'calendar';
  onViewModeChange: (mode: 'board' | 'calendar') => void;
}
```

### Menu panel
Slide-over zprava, `min(330px, 86vw)`, sekce **Navigace · Akce · Zobrazení · Motiv · Profil**. Obsahuje vše, co na mobilu zmizelo z lišty a toolbaru — nic se neztratilo.

A11y: `role="dialog"` + `aria-modal`, `aria-expanded`/`aria-controls` na hamburgeru, **Escape zavírá**, `body` se pod panelem nescrolluje, focus jde do panelu, všechny položky **min. 44 px** vysoké, `prefers-reduced-motion` vypíná animaci.

### Odstranění přetékání (naměřeno v auditu: 393 px > 375 px)
Na mobilu se skrývá jen to, co má **náhradu v menu**:
- `.navbar-center`, `.navbar-right` → Navigace / Motiv / Profil v menu
- `.pi-chip-btn`, `.toolbar-new-task-btn` → sekce Akce
- `.board-view-switch-row` → sekce Zobrazení

**Nastavení a přepínač hero v toolbaru zůstávají viditelné** — nemají v menu náhradu, takže skrýt je by znamenalo ztrátu funkce. Toolbar je i tak krátký a nepřetéká.

### Druhý zásah do inline stylů
`.navbar-right` měl layout v inline stylu (`display: flex`), který **přebíjí media query** — panel se proto na mobilu neschoval. Přesunuto do CSS **s identickými hodnotami**. Stejná past jako u toolbaru v R2; v kódu je u obou poznámka proč.

## Změněné soubory
- `src/components/layout/Navbar.tsx` — `navItems`, `boardActions`, hamburger, menu panel, inline → třída
- `src/app/projects/[projectId]/page.tsx` — předání `boardActions`
- `src/app/globals.css` — `.navbar-right` základ, blok mobilní navigace, mobilní overrides
- `e2e/kanban.spec.ts` — nový describe `Clearspace mobilní navigace` (3 testy)

## Ověření
| Šířka | Výsledek |
|---|---|
| **1440** | **Identické** ✅ — navigace, motiv, avatar, PI, Nový úkol, přepínač zobrazení, stats 4 v řadě |
| **768** | **Beze změny proti R2** ✅ — hamburger skrytý (`display: none`), přetékání 753/753 |
| **375** | Navbar = logo + hamburger ✅ · menu funkční ✅ · **přetékání 375/375 — vyřešeno** ✅ |

Ověřeno i reálné chování: přepnutí Board/Kalendář z menu (menu se zavře, scroll lock se uvolní), otevření Project Intelligence z menu, Escape.

- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npx playwright test`: **9/9** · `npm run build`: **úspěšný**

## Známé, řeší další fáze
- **Hlavička Project Intelligence / task detail draweru na 375 px přetéká** — pozicovací bar (Left/Focused) i křížek jsou uříznuté. Není to regres z R3 (drawer se choval stejně i dřív), ale na mobilu jde panel zavřít jen Escapem. → **R5** (dialogy a drawery fullscreen s lepivou hlavičkou).
- Sloupce boardu jsou na mobilu stále ~520 px široké → **R4** (~280 px s peek na další sloupec).
- Popisky stats se lámou („V PRŮBĚH…") → **R4**.

## Dál
**R4 — Mobilní layout** (hero, toolbar, stats, šířka sloupců).

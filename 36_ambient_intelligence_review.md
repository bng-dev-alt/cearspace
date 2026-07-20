# Review — Ambientní Project Intelligence (pulse chip + chytré dlaždice + ⌘I)

Dokončení hlavního odlišováku: inteligence je teď **cítit i bez otevření panelu**. Tři ambientní prvky, všechny staví na existující deterministické funkci `computeProjectIntelligence`.

## 1. Pulse chip v toolbaru
Tlačítko „Project Intelligence" nese **živou tečku stavu zdraví** projektu:
- zelená = V pořádku, **amber (pulzuje)** = Vyžaduje pozornost, **červená (pulzuje)** = V ohrožení.
- Tooltip = `{label} — {reason} (⌘I)`.
- Pulzování jen u attention/risk; respektuje `prefers-reduced-motion`.

Tím se ze statického tlačítka stává „puls" — signál je vidět dřív, než klikneš.

## 2. "Chytrá" stat dlaždice
Dlaždice **Blokováno** je při `blockedCount > 0` interaktivní: místo chevronu nese teal mikro-akci **„Vyřešit →"**, je klikatelná (i klávesnicí, `role="button"`, `focus-visible`) a otevře Project Intelligence. Klidné dlaždice (Celkem, V průběhu, Dokončeno) zůstávají klidné — pozornost jde tam, kde je potřeba.

## 3. Klávesová zkratka ⌘I / Ctrl+I
Globální listener na board stránce otevře panel z klávesnice — signál kvality (Linear/Raycast). Ověřeno v prohlížeči.

## Architektura
- Board stránka počítá `intelHealth = useMemo(() => computeProjectIntelligence(columns).health, [columns])` a předává:
  - `intelHealth` → `Toolbar` (chip),
  - `onOpenIntelligence` → `StatsRow` (chytrá dlaždice).
- Žádná duplikace logiky — vše z jedné deterministické funkce.

## Upravené soubory
- `app/projects/[projectId]/page.tsx` — `intelHealth` useMemo, ⌘I keydown, propojení chip + dlaždice.
- `components/toolbar/Toolbar.tsx` — pulse dot + tooltip na PI chip (`intelHealth` prop).
- `components/toolbar/StatsRow.tsx` — chytrá dlaždice Blokováno (mikro-akce, klikatelná, a11y).
- `app/globals.css` — `.pi-chip-dot` (+ pulz, reduced-motion), `.stat-card-actionable`, `.stat-action`.

## Ověření (demo, prohlížeč)
- Chip s amber pulzující tečkou (1 blokátor + 2 po termínu → attention).
- Dlaždice Blokováno „Vyřešit →" otevírá panel.
- `⌘I` otevírá panel.

## Výsledky
- `npm run lint`: **0/0**
- `npx vitest run`: **96/96**
- `npm run build`: **úspěšný**

## Mimo tento krok
Cockpit header (přepis hlavičky na zdraví + burndown) jako dlouhodobá vize; kontinuální/proaktivní notifikace při zhoršení zdraví.

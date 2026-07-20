# Design Bible — Fáze 6: Tým + AI modaly + Project Intelligence

Sladění týmu, AI modalů a Project Intelligence panelu do jednotného emerald/glass jazyka. **Funkce beze změny** (přidání/úprava/mazání členů, generování projektu/sprintu/úkolů, analýza rizik, správa členů projektu, panel inteligence).

## AI modaly — dořešení fialovo-modrých tintů
V AI modalech zůstávaly staré **modré (`rgba(32,157,215,…)`) a fialové (`rgba(117,57,145,…)`) tinty** + dva **fialovo-modré gradienty** (`#753991 → #209dd7`) na ikonách/tlačítkách. Sjednoceno na **emerald**:
- Všechny modré/fialové rgba tinty → `var(--accent-soft)` (konzistentní selected/info stav).
- Gradienty → plný `var(--accent)` (emerald header ikona, generate akcenty).
- Dotčeno: `GenerateProjectModal`, `GenerateTasksModal`, `GenerateSprintModal`, `ProjectMembersModal`, `MultiAssigneeSelect`.
- Ověřeno: modal AI Project Studio má emerald header ikonu, emerald selected stavy, žádné modré/fialové.

## Tým
- Tabulka členů (`.members-table`) je class-based a už tokenizovaná (emerald „Owner" role-badge, success „Účet" chip, emerald hover/akce). Bump radius `12px` → `var(--radius-card)`.
- **Member avatary si drží identitní barvy** (různorodá paleta) — správně, nejsou to akcenty.
- `MemberFormModal` preset avatar barev: default swatch stará teal `#0d9488` → emerald `#0f9d6e` (+ nahrazen duplicitní green za sky pro pestrost).

## Project Intelligence panel
- Bez změny — panel už používá jen tokeny (emerald z Fáze 0). Ověřeno, žádné hardcoded barvy.

## Změněné soubory
- `src/components/board/GenerateProjectModal.tsx`, `GenerateTasksModal.tsx`, `GenerateSprintModal.tsx`, `ProjectMembersModal.tsx`, `MultiAssigneeSelect.tsx` — blue/purple → emerald.
- `src/app/globals.css` — `.members-table` radius.
- `src/components/team/MemberFormModal.tsx` — preset avatar barvy.

## Důležitá rozhodnutí
- **AI modaly NEmigrovány na `ModalShell` primitiv.** Mají složité vlastní hlavičky, taby, stavy a logiku (např. AI Project Studio je multi-step formulář + preview). Plná migrace by byla riziková a měnila UX. Zvolena **bezpečná cesta: sjednocení barev/radiusu přes tokeny při zachování struktury**. `ModalShell` se použije u nových/jednodušších dialogů.
- **Member avatar barvy zachovány** — jsou to identitní barvy, ne brand akcent.

## Odchylky od Design Bible
- AI modaly zůstávají na vlastní struktuře (ne `ModalShell`) — vědomé rozhodnutí kvůli zachování 100 % funkce a UX. Vizuálně jsou konzistentní (emerald/glass/radius z tokenů).

## Ověření
- Tým **Dark**: glass tabulka, emerald „Owner"/„Přidat člena", success „Účet" chip, identitní avatary.
- AI Project Studio modal **Dark**: emerald header ikona, emerald selected stavy, dark glass.
- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npm run build`: **úspěšný**.

## Dál (Fáze 7 — finální)
Empty states + tabulky (adopce `.cs-table`/`EmptyState` kde chybí) + a11y (WCAG AA kontrast, focus stavy) + responzivita + finální konzistenční sweep napříč všemi obrazovkami Dark i Light + úklid mrtvých stylů.

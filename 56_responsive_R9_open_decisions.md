# R9 — Dotažení dvou otevřených rozhodnutí

Dvě věci, které jsem z R7/R8 nechal na tvoje slovo. Obojí je hotové.

---

## 1. Brandové barvy ve světlém motivu

Ztmaveno tak, aby prošly AA (4.5:1) i jako text. **Tmavý motiv beze změny** — tam obě barvy procházely už předtím.

| Token | Před | Po | Kontrast na bílé |
|---|---|---|---|
| `--accent` | `#0f9d6e` | `#0b7d57` | 3.46 ❌ → **5.14** ✅ |
| `--accent-hover` | `#0b8459` | `#096644` | (odvozeno, aby hover zůstal tmavší) |
| `--danger` | `#e5484d` | `#d13438` | 3.91 ❌ → **4.93** ✅ |

`--accent-soft` a `--accent-ring` přepočítány na nové RGB, ať odstín sedí.

**Bonus, který z toho vypadl:** bílý text na výplni accentového tlačítka měl 3.46:1 (taky pod limitem). Teď má **5.14:1** — takže se opravilo i něco, co jsem původně považoval za v pořádku.

### Kompletní kontrastní tabulka po změně
| | Světlý | Tmavý |
|---|---|---|
| `--accent` na povrchu | **5.14** ✅ | **7.20** ✅ |
| `--danger` na povrchu | **4.93** ✅ | **5.54** ✅ |
| `--text-muted` na povrchu | **4.99** ✅ | **5.08** ✅ |
| Bílý text na accentu | **5.14** ✅ | 8.87 ✅ |

Vizuálně: zelená je hlubší, ale pořád zřetelně tatáž značka. Ověřeno screenshotem světlého desktopu.

---

## 2. Hero výchozí sbalené na mobilu

```ts
const stored = localStorage.getItem('hide_hero_section');
const hidden =
  stored === null ? window.matchMedia('(max-width: 767px)').matches : stored === 'true';
```

Klíčový detail: testuje se na **`null`**, ne na `'false'`. Mobilní výchozí stav se tedy uplatní **jen u uživatele, který se ještě nerozhodl**. Jakmile si jednou hero rozbalí, jeho volba platí na všech šířkách a napříč reloady.

Žádný hydratační nesoulad — preference se čte v efektu, který tam už byl, ne v lazy initializeru.

### Výsledek na 375 px
| | boardTop |
|---|---|
| Před | 724 px |
| Po | **469 px** |

Board je konečně nad ohybem — karty jsou vidět bez scrollování. Desktop výchozí stav ověřeně beze změny (hero 156 px s titulkem).

---

## Zádrhel: rozbité unit testy

Po změně hera spadlo **6 unit testů**: `window.matchMedia is not a function`. jsdom to API neimplementuje.

Nešel jsem cestou obcházení v produkčním kódu (`typeof window.matchMedia === 'function' ? ...`), protože to by znamenalo psát horší kód kvůli mezeře v testovacím prostředí. Místo toho **náhrada v `src/setupTests.ts`**, kde tahle mezera patří. Výchozí odpověď je „neshoduje se", takže unit testy běží v desktopové větvi.

---

## Nové testy
- mobil: hero je výchozí sbalené, rozbalení se uloží a **přežije reload**
- desktop: hero zůstává výchozí rozbalené

> První verze testu používala `toBeHidden()` na `.hero-title` a padala. Sbalení totiž jede přes `opacity: 0` + `grid-template-rows: 0fr`, což Playwright za skryté nepovažuje. Test teď kontroluje **stavovou třídu `.collapsed`**, což je skutečný zdroj pravdy.

## Ověření
- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npx playwright test`: **22/22** · `npm run build`: **úspěšný**
- Kontrast: **všechny páry AA v obou motivech**
- Desktop: layout i výchozí stavy beze změny; jediné, co je vidět, jsou záměrně ztmavené odstíny

Připraveno k pushnutí.

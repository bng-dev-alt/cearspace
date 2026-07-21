# R10 — Oprava iOS auto-zoomu (iPhone 13 Pro)

Hlášení: na iPhonu 13 Pro se aplikace „plave do stran", jako by byla širší než displej.

## Příčina

**Safari na iOS automaticky zoomne stránku, když uživatel klepne do formulářového pole s písmem menším než 16 px** — a po rozostření pole zoom **nevrátí zpět**. Od té chvíle je layout širší než displej a jde s ním jezdit do stran.

Aplikace měla **15 polí pod limitem**, od 12 px výš:

```
12.0px  SELECT.toolbar-select            12.8px  INPUT.form-input
12.8px  INPUT.toolbar-search-input       12.8px  TEXTAREA.form-textarea
12.8px  SELECT.drawer-select (3x)        13.1px  INPUT (team-search)
12.8px  INPUT.drawer-date-input          13.6px  TEXTAREA.drawer-desc-textarea
12.8px  INPUT.checklist-add-input        13.6px  INPUT (login/register)
12.8px  TEXTAREA.comment-textarea        14.4px  TEXTAREA.pi-ask-input
```

Stačilo klepnout do vyhledávání nebo do libovolného pole v detailu úkolu.

## Proč to neodhalilo 22 testů

Celou responzivní etapu jsem ověřoval v **Chromiu** (Playwright i emulace v prohlížeči). Auto-zoom na malých polích je **chování výhradně Safari na iOS** — v Chromiu neexistuje, takže ho žádné moje měření nemohlo zachytit. Kontroloval jsem šířky, přetékání i dotykové cíle, ale ne tenhle mechanismus.

To je moje chyba a poučení: **emulace mobilu v desktopovém prohlížeči neověří chování mobilního prohlížeče.**

## Oprava

Všechna pole mají na mobilu **16 px** — přesně práh, pod kterým Safari zoomuje. Plus `-webkit-text-size-adjust: 100%` na `html`, aby iOS samo nenafukovalo písmo.

### Co jsem záměrně NEudělal
Existuje jednodušší „oprava" — přidat do viewport meta `maximum-scale=1, user-scalable=no`. Zoom by se tím vypnul taky, ale **zároveň by uživatel přišel o možnost si stránku přiblížit prsty**. To je porušení **WCAG 1.4.4 (Resize Text)** a pro lidi se slabším zrakem zásadní problém. Tou cestou jsem nešel.

### Pole se stylem inline (posedmé tatáž past)
Přihlašovací a registrační pole mají `fontSize` **inline**, takže by na ně media query nedosáhla. Vyřešeno tokenem:

```css
:root { --auth-input-font: 0.85rem; }
@media (max-width: 767px) { :root { --auth-input-font: 16px; } }
```

Inline styl zůstal, jen čte hodnotu z tokenu. Desktop se nemění a struktura JSX zůstala nedotčená.

> Mezikrok stojí za zaznamenání: nejdřív jsem inline `fontSize` chtěl ze souborů odstranit skriptem. Skript rozbil strukturu JSX (`tsc` spadl na 6 chybách). Vrátil jsem soubory přes `git checkout` a zvolil tokenovou cestu, která nesahá do struktury vůbec.

## Změněné soubory
- `src/app/globals.css` — `text-size-adjust`, token `--auth-input-font`, blok „R10"
- `src/app/login/page.tsx`, `src/app/register/page.tsx` — inline `fontSize` → token (6 polí)
- `e2e/ios-zoom.spec.ts` — nový test

## Nový test
`e2e/ios-zoom.spec.ts` projde board, detail úkolu, dialog, Project Intelligence, Tým, přihlášení i registraci na šířce 390 px a **spadne, pokud jakékoli pole klesne pod 16 px**. Druhý test hlídá, že přihlašovací pole má na desktopu dál 0,85 rem.

## Ověření
| | Výsledek |
|---|---|
| Pole pod 16 px @390 px | 15 → **0** ✅ |
| Desktop @1440 | přihlašovací pole **13,6 px, beze změny** ✅ |
| Vodorovné přetékání | dál 0 na 320–1440 ✅ |

- `npm run lint`: **0/0** · `npx vitest run`: **100/100** · `npx playwright test`: **24/24** · `npm run build`: **úspěšný**

## Co ještě může na iPhonu překvapit
Pole jsou teď 16px, takže **vstupy na mobilu vypadají o něco větší**. To je záměr — a shodou okolností to sedí k dotykovým cílům 44 px z R7.

Kdyby se „plavání do stran" objevilo znovu, nejpravděpodobnější zbylá příčina je **vodorovný scroll samotného boardu** (sloupce 280 px vedle sebe), který je ale záměrný — board se posouvá do stran, stránka ne.

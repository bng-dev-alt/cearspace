# Review modulu Collaboration (Release 20 - Team Foundation)

Tento dokument shrnuje technické řešení, architektonická rozhodnutí a výsledky ověření pro zavedení základů týmové spolupráce a systému přiřazení více řešitelů (Multi-Assignee) k úkolům.

## 1. Architektura modulu Collaboration

Navržený systém je modulární a zajišťuje plnou zpětnou kompatibilitu se stávajícími AI funkcemi i relačními strukturami.

- **Datový model**: Rozhraní `TeamMember` obsahuje atributy `id`, `fullName`, `initials`, `avatarColor` a `createdAt`. Datový model karty `Card` byl rozšířen o pole `assignees: TeamMember[]`.
- **Zpětná kompatibilita (AI a DB)**: Relační databáze a stávající AI asistenti předpokládají pouze jednoho řešitele v poli `assignee`. Tento stav byl vyřešen automatickým mapováním:
  - Při ukládání karty se do pole `assignee` automaticky propisuje první člen ze seznamu `assignees`.
  - Při načítání karet z databáze bez pole `assignees` se seznam řešitelů sestaví z informací v polích `assignee_name`, `assignee_initials` a `assignee_color`.
  - AI prompty a kalkulátory nákladů zůstávají plně funkční a pracují s primárním řešitelem.
- **Kaskádové úpravy a mazání**: Služba `kanbanService` při úpravě nebo smazání člena týmu provádí synchronní sken všech karet v projektu. Úprava jména, iniciál či barvy člena se ihned promítne na všech jeho kartách. Smazání člena z projektu jej automaticky odebere ze seznamu řešitelů všech přiřazených karet.

## 2. Přehled implementovaných změn

- **useKanbanBoard**: Hook spravuje stav `teamMembers` pro aktivní projekt a poskytuje metody `addTeamMember`, `editTeamMember` a `deleteTeamMember`. Při přidání karty se odesílá pole `assignees`. Vyhledávání a filtrování na nástrojové liště (Toolbar) bylo upraveno tak, aby vyhledávalo shody napříč celým polem `assignees` úkolu.
- **MultiAssigneeSelect**: Nová vysoce interaktivní komponenta pro výběr řešitelů. Podporuje fulltextové vyhledávání členů, ovládání pomocí klávesnice (šipky nahoru/dolů, Enter pro přepnutí volby, Escape pro zavření) a zobrazuje barevné iniciály vybraných členů.
- **TeamManagementModal**: Modální okno pro kompletní správu členů týmu (přidání nového člena, editace jména/e-mailu/barvy a smazání člena). Výpočet iniciál probíhá automaticky při psaní celého jména.
- **Zobrazení na Kanban kartách**: Komponenta `KanbanCard` vykresluje překrývající se barevné kruhy (avatary) pro první 3 řešitele úkolu s bílým ohraničením. Pokud má úkol více než 3 řešitele, zobrazuje se indikátor `+N` (např. `+2`) s tooltipem se jmény zbývajících řešitelů.
- **TaskDetailDrawer**: Integruje komponentu `MultiAssigneeSelect` pro okamžité přiřazování řešitelů za běhu s okamžitou synchronizací. Obsahuje skrytý element `<select>` s testid `drawer-assignee-select` pro zachování plné kompatibility se stávajícími integračními testy.

## 3. Rozhodnutí v oblasti UX/UI

- **Designové ladění a barvy**: Všechny vizuální prvky odpovídají barevné paletě definované v `strategy.md`. Kruhové avatary mají jemné stíny a bílé ohraničení, které ladí s pozadím karet.
- **Zachování světlého designového jazyka**: Pro zachování jednotného a čistého vzhledu aplikace (warm off-white layout) byly z CSS souborů odstraněny všechny automatické přepínače a přepisy tmavého režimu (Dark Mode). Celá aplikace se tak zobrazuje v elegantních světlých tónech nezávisle na nastavení operačního systému uživatele.
- **Přístupnost z Toolbaru**: Přímo v hlavní liště boardu se vedle filtrů zobrazují avatary členů projektu s tlačítkem "Tým", což umožňuje rychlé otevření správy týmu bez nutnosti odcházet z rozpracované stránky.
- **Propojení globální navigace**: Proklik "Tým" v hlavním horním menu (Navbar) byl plně zprovozněn. Pokud se uživatel nachází v jiné sekci (Projekty, AI Studio apod.), kliknutím je přesměrován na nástěnku a modální okno pro správu týmu se automaticky otevře při načtení.
- **Automatická inicializace členů**: Pokud je načten projekt bez uložených členů týmu (např. starší projekty v localStorage), systém mu automaticky přiřadí výchozí testovací členy (DEFAULT_MEMBERS), což zabraňuje prázdným stavům.

## 4. Výsledky testování a ověření

Provedená verifikace potvrdila bezchybný stav aplikace:
1. **TypeScript a Lint**: Příkaz `npm run lint` proběhl bez jediné chyby či varování.
2. **Next.js Production Build**: Příkaz `npm run build` úspěšně zkompiloval celou aplikaci a vygeneroval optimalizovaný produkční build.
3. **Automatizované testy (Vitest)**: Byla vytvořena nová sada unit testů `teamManagement.test.tsx` ověřující kaskádové mazání, kaskádové aktualizace, synchronizaci s legacy poli a kompatibilitu promptů. Celý testovací proces úspěšně dokončil všech 77 testů ve 14 souborech:
   - Celkem spuštěno: 77 testů.
   - Stav: Všechny testy prošly (77/77).

# Review Release 21 - Data Foundation

Stabilizační release. Žádné nové produktové funkce -- cílem bylo ověřit závěry architektonického auditu proti skutečnému kódu a odstranit nejkritičtější technický dluh v datové vrstvě, aniž by se zastavilo tempo vývoje.

---

## A. Výsledky opětovného architektonického auditu

### 1. Team Foundation (Release 20) nepersistuje do Supabase -- POTVRZENO

- `addTeamMember`, `updateTeamMember` a `deleteTeamMember` byly jediné metody v `kanbanService`, které neměly žádnou větev `hasSupabaseConfig` -- zapisovaly bezpodmínečně do localStorage. V produkčním (Supabase) režimu se členové týmu ztráceli mimo daný prohlížeč.
- Navíc: `createCard` ani `updateCard` v Supabase větvi vůbec neukládaly pole `assignees`. Do DB se propisoval jen primární řešitel (`assignee_name/initials/color`), takže z více řešitelů přežil reload pouze první -- ztráta dat by design.
- Nový nález během verifikace: `createProject` v Supabase režimu vkládal celý objekt projektu včetně klíče `teamMembers`, který v DB neexistuje. Insert proto **vždy selhal** a projekt se tiše uložil jen lokálně -- vytváření projektů v produkčním režimu fakticky nefungovalo.
- Dále: `fetchProjectById` pro výchozí projekt (`project-default-*`) četl vždy z localStorage i v Supabase režimu.

### 2. Rozbité a nekonzistentní SQL schéma -- POTVRZENO

- Policy pro `task_activities` měla chybějící uzavírací závorku -- celý skript `supabase_schema.sql` by při spuštění selhal se syntaktickou chybou.
- Chyběly sloupce, které kód očekával nebo potřeboval: `cards.assignees` (kód jej četl ve `fetchBoardData`, ale žádné schéma jej nevytvářelo) a úložiště pro členy týmu.
- `CREATE POLICY` příkazy nebyly idempotentní -- opakované spuštění skriptu by selhalo na duplicitních policy.
- Aspirativní enterprise schéma v `review.md` (workspaces, boards, relační members) nebylo nikdy implementováno a neodpovídá realitě.

### 3. kanbanService jako god-object s tichým fallbackem -- POTVRZENO

- 1045 řádků, téměř každá metoda ručně větvila localStorage vs. Supabase.
- Při selhání Supabase zápisu (`createProject`, `saveProjectColumns`, `createColumn`, `deleteColumn`, `reorderColumns`, `restoreProjectSnapshot`) se data tiše zapsala do localStorage -- vznikaly dvě rozdílné verze dat (split-brain), o kterých uživatel nevěděl.
- Fire-and-forget zápisy (`createCard`, `updateCard`, `moveCard`...) selhání pouze zalogovaly do konzole; UI dál tvrdilo, že je vše uloženo.

### 4. Trojí nespojená identita (Profile / TeamMember / Assignee) -- POTVRZENO

- `Profile` (auth uživatel), `TeamMember` (kontakt v projektu) a `Assignee` (denormalizovaný string na kartě) bez jakékoliv relace.
- Mapování `assignees[0] -> assignee` bylo zduplikované na ~6 místech (hook i service, pokaždé ručně).

### 5. useKanbanBoard god-hook, ID z Date.now(), statistiky přes názvy sloupců -- ČÁSTEČNĚ POTVRZENO (řešení odloženo)

- Potvrzeno jako reálný dluh, ale nejde o akutní riziko ztráty dat. Plné rozdělení hooku a přechod na UUID + frakční pozice je zásah napříč celou aplikací -- odloženo do Release 22+ (viz sekce F). V rámci R21 byla alespoň odstraněna duplicitní logika mapování řešitelů.

### 6. Chybějící roadmapa / drift od strategy.md -- POTVRZENO (mimo rozsah kódu)

- `strategy.md` stále popisuje MVP s jedním boardem bez persistence. Žádný dokument jej nenahradil. Tento release to neřeší kódem; doporučení viz sekce F.

### 7. AI vrstva -- NEPOTVRZENO (žádný problém)

- Server-side proxy přes `/api/ai/*`, klíč neopouští server, provider factory, normalizované chyby. Beze změn.

---

## B. Provedené opravy

1. **Supabase persistence členů týmu**: `addTeamMember` / `updateTeamMember` / `deleteTeamMember` mají plnohodnotnou Supabase větev -- členové se ukládají do `projects.team_members` (JSONB). Aktualizace ověřuje, že řádek projektu existuje (`update ... select('id')`); u výchozího projektu se chybějící řádek automaticky založí přes `upsert`.
2. **Persistence multi-assignee**: `createCard`, `updateCard`, `seedInitialData` i `restoreProjectSnapshot` ukládají pole `assignees` do `cards.assignees` (JSONB). Legacy sloupce (`assignee_name/initials/color`) se dál plní primárním řešitelem kvůli zpětné kompatibilitě a AI promptům.
3. **Kaskádové úpravy v DB**: úprava/smazání člena týmu v Supabase režimu kaskádově aktualizuje seznamy řešitelů na všech kartách projektu (`cascadeDbAssignees`), stejně jako to dosud fungovalo lokálně.
4. **Oprava rozbitého createProject**: insert nyní posílá korektní DB tvar (`projectToDbRow`) včetně `team_members`; vytváření projektů v Supabase režimu poprvé skutečně funguje.
5. **fetchProjectById**: v Supabase režimu čte z DB i pro výchozí projekt (`maybeSingle`), s bezpečným fallbackem na syntetický výchozí projekt, dokud není naseedován.
6. **SQL schéma**: opravena rozbitá policy `task_activities`, doplněny sloupce `projects.team_members` a `cards.assignees`, všechny policy jsou idempotentní (`DROP POLICY IF EXISTS` + `CREATE POLICY`) -- skript lze bezpečně spustit opakovaně.
7. **Konec tichého split-brain fallbacku**: v Supabase režimu se při chybě zápisu už nikdy nezapisuje do localStorage. Awaited operace chybu propagují (volající mají try/catch), fire-and-forget operace ji nahlásí přes nový modul `persistenceStatus`.
8. **Transparentní hlášení chyb**: nový modul `services/persistence.ts` (subscribe/report/clear). Hook `useKanbanBoard` vystavuje `syncError` a board stránka jej zobrazuje v existujícím chybovém banneru. Po úspěšném zápisu se stav sám vyčistí.
9. **Rozdělení kanbanService (bezpečný rozsah)**: lokální úložiště vyčleněno do `services/storage/localStore.ts`, mapování DB <-> aplikační model centralizováno do funkcí `mapDbProject` / `mapDbCard` / `cardToDbFields` / `projectToDbRow`, mapování řešitelů do `utils/assignees.ts`. Veřejné API `kanbanService` zůstalo beze změny (žádný import se nemusel měnit).
10. **Deduplikace mapování řešitelů**: `toPrimaryAssignee` a `legacyAssigneeToMember` nahradily šest ručních kopií téže logiky v hooku, service i localStore.

## C. Nové soubory

- `frontend/src/services/persistence.ts` -- transparentní stav persistence (report / clear / subscribe).
- `frontend/src/services/storage/localStore.ts` -- lokální (demo) úložiště; jediné místo, které smí sahat na localStorage boardu a projektů.
- `frontend/src/utils/assignees.ts` -- jediné místo mapování TeamMember[] <-> legacy Assignee.
- `frontend/src/__tests__/assignees.test.ts` -- testy mapovacích utilit (4 testy).

## D. Upravené soubory

- `frontend/supabase_schema.sql` -- oprava policy, nové sloupce, idempotence.
- `frontend/src/services/kanbanService.ts` -- Supabase persistence týmu a multi-assignee, odstranění tichých fallbacků, centrální mapování; zmenšeno z 1045 na ~880 řádků se stejným veřejným API.
- `frontend/src/hooks/useKanbanBoard.ts` -- `syncError`, použití sdílených mapovacích utilit, ošetření chyb awaited operací se sloupci.
- `frontend/src/app/projects/[projectId]/page.tsx` -- chybový banner zobrazuje i `syncError`.

## E. Dopad na architekturu

- **Jedna pravda o datech v každém režimu**: Supabase režim pracuje výhradně s DB (localStorage se používá jen jako read-only nouzové zobrazení při výpadku čtení, a i to se uživateli nahlásí). Demo režim pracuje výhradně s localStorage. Split-brain zápisů je odstraněn konstrukčně, ne konvencí.
- **Chyby persistence jsou viditelné**: neúspěšný zápis znamená banner v UI, ne tichý console.error.
- **Mapování DB <-> model na jednom místě**: budoucí změny schématu (R22) se dotknou jen mapovacích funkcí, ne dvaceti roztroušených objektů.
- **JSONB jako vědomý mezikrok**: `projects.team_members` a `cards.assignees` jsou záměrně JSONB, ne relační tabulky. Přesně kopírují dnešní aplikační model, takže změna kódu byla minimální a bezpečná. Komentář ve schématu explicitně říká, že R22 je normalizuje do relací navázaných na `profiles`.
- **Public API beze změn**: `kanbanService` má identickou signaturu jako před releasem -- žádná komponenta, test ani AI služba se nemusely přizpůsobovat.

## F. Co doporučuji ponechat na Release 22

1. **Sjednocení identity**: `TeamMember` navázat na `profiles` (pozvaní uživatelé + placeholder členové), `Assignee` zrušit ve prospěch relace `card_assignees`. Mapovací vrstva z R21 (`utils/assignees.ts`, `mapDbCard`) je na to připravená -- změna se odehraje na jednom místě.
2. **Normalizace JSONB -> relace**: `projects.team_members` a `cards.assignees` převést na tabulky s FK, jakmile existuje relační identita (bod 1). Dřív to nedává smysl.
3. **Rozdělení `useKanbanBoard`**: board data přes server-state knihovnu (TanStack Query), filtry/řazení jako čisté funkce, tým jako samostatný hook. Prerekvizita pro Realtime.
4. **UUID + frakční pozice** místo `Date.now()` ID a celočíselných pozic -- prerekvizita pro souběžnou práci více uživatelů (Realtime v R23).
5. **Roadmapa**: nahradit zastaralý `strategy.md` jednostránkovým dokumentem, který ukotví cílový stav produktu (tenancy, demo režim, dark mode, i18n).
6. **Migrace přes Supabase CLI**: `supabase_schema.sql` je nyní idempotentní a bezpečný, ale verzované migrace jsou správný další krok.

## G. Výsledek manuálního testování

- Dev server (`npm run dev`) spuštěn čistě, bez chyb a varování v logu.
- Všechny routy vracejí HTTP 200: `/`, `/login`, `/register`, `/ai-history`, `/ai-control-center`, `/projects/project-default`.
- Úvodní stránka renderuje obsah aplikace (ověřeno v HTML odpovědi).
- Omezení: interaktivní proklik v prohlížeči nebyl v tomto prostředí dostupný; interakce (drag&drop, drawer, team modal, AI modály) jsou pokryty sadou 81 automatizovaných testů, které všechny prošly. Prostředí nemá nakonfigurované Supabase přihlašovací údaje (`.env.local` obsahuje jen GEMINI klíče), takže aplikace běží v demo režimu -- Supabase větve jsou ověřeny typovou kontrolou, buildem a code-review; doporučuji po nasazení schématu jeden ruční smoke test v produkčním režimu.

## H. Výsledek lint

- `npm run lint`: **0 chyb, 0 varování**.

## I. Výsledek build

- `npm run build`: **úspěšný** (Compiled successfully, všech 14 stránek vygenerováno).

## J. Výsledek testů

- `npx vitest run`: **81/81 testů prošlo v 15 souborech** (77 původních + 4 nové testy mapovacích utilit). Pokrývá: kanban board, kanbanService (izolace projektů, seeding), drawer, task detail modes, team management (kaskády, legacy synchronizace, AI kompatibilita), auth, produktivitu, AI služby, AI historii, generování projektů/úkolů/sprintů a risk analysis.

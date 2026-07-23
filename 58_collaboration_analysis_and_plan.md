# Team Collaboration MVP — Analýza a implementační plán

Analýza současné architektury proti `TEAM_COLLABORATION_AGENT.md`. **Zatím bez implementace.**

---

## Část 1: Co už v projektu je

Architektura je podstatně dál, než dokument předpokládá. Nezačínáme na zelené louce.

| Oblast | Stav |
|---|---|
| Supabase klient | ✅ `src/lib/supabase.ts`, přepínač `hasSupabaseConfig` |
| DB schéma | ✅ `frontend/supabase_schema.sql` — idempotentní, releasy 21–23 |
| Tabulky | ✅ `profiles`, `projects`, `columns`, `cards`, `task_checklists/comments/activities`, `workspace_members`, **`project_members`**, `card_assignees` |
| RLS | ⚠️ zapnuté, ale **výhradně na vlastníka** |
| Datová vrstva | ✅ **granulární** mutace (`createCard`, `updateCard`, `moveCard`, `deleteCard`, `createColumn`, `updateColumnName`, `deleteColumn`, `reorderColumns`) |
| Auth | ✅ `AuthContext` s reálnou i mock větví |
| Členové UI | ✅ stránka `/team`, `ProjectMembersModal`, `useWorkspaceMembers` |
| Chybí úplně | ❌ `invitations`, projektový `activity_logs`, Realtime, Presence |

### Dobrá zpráva pro realtime
Servisní vrstva **nepřepisuje celý board**, ale mění jednotlivé entity. Postgres change events se tak mapují 1:1 na existující operace. Kdyby se board ukládal celý (delete + reinsert), byl by realtime prakticky neproveditelný. Jediná výjimka je `saveProjectColumns` (jen prvotní založení) a `restoreProjectSnapshot` (AI rollback) — viz rizika.

---

## Část 2: Tři nálezy, které mění zadání

### 2.1 RLS je vlastnická, ne členská — hlavní blocker
Všechny politiky stojí na jediné podmínce:

```sql
USING (auth.uid() = projects.user_id)
```

Druhý uživatel, i kdyby byl v `project_members`, **nepřečte z projektu ani řádek**. Dokud se tohle nezmění, žádná spolupráce nefunguje — a je to změna, která se dotýká všech tabulek najednou. Proto musí jít jako první.

### 2.2 `project_members` existuje, ale znamená něco jiného
Tabulka už je, jenže odkazuje na `workspace_members`, což je **kontaktní seznam vlastněný jedním uživatelem** (`RLS: auth.uid() = owner_id`). Dnešní „členové" jsou tedy **jmenovky bez účtu**, ne spolupracovníci.

Sloupec `workspace_members.profile_id` (nullable) je jako most na reálné účty už připravený — dobrá předvídavost z releasu 23.

**Doporučení:** oddělit dvě různé věci, které dnes splývají:

| Účel | Zdroj pravdy |
|---|---|
| **Autorizace** — kdo smí do projektu | `project_members(project_id, user_id → profiles, role)` |
| **Přiřazení a zobrazení** — komu je úkol přidělen | `workspace_members` + `card_assignees` (beze změny) |

Jedna tabulka nemůže dobře sloužit obojímu: autorizace potřebuje reálný účet, přiřazení musí fungovat i pro člověka bez účtu. Stávající `project_members` bych přejmenoval na `project_assignees` a název `project_members` použil pro autorizaci.

> Alternativa je nechat vše na `workspace_members` a v RLS řetězit `project → project_members → workspace_members.profile_id`. Ušetří to migraci, ale identita zůstane rozdvojená a stejný člověk pozvaný do dvou cizích projektů bude mít dva řádky. **Nedoporučuji.**

### 2.3 Supabase není vůbec nakonfigurované
`.env.local` obsahuje jen klíče pro Gemini. `NEXT_PUBLIC_SUPABASE_URL` i `ANON_KEY` **chybí**, takže aplikace běží celá v demo režimu nad `localStorage`.

Bez Supabase projektu se **nic z tohoto zadání nedá odzkoušet** — je to tvrdý předpoklad fáze 0 a je na tobě (zakládá se účet, generují se klíče).

---

## Část 3: Dvě odchylky od zadání, které doporučuju

### 3.1 Demo režim musí přežít
Dnešní silná vlastnost aplikace: **rozjede se bez jakéhokoli backendu**. Pro portfolio je to zásadní — kdokoli otevře odkaz a hned si hraje.

Spolupráce je ze své podstaty serverová. Navrhuju proto **aditivní přístup**: kolaborační funkce se zobrazí jen tam, kde je Supabase nakonfigurované, jinak se tiše skryjí. Žádné rozbité tlačítko v demu.

### 3.2 Pozvánky nejdřív odkazem, e-mail až potom
Zadání chce e-mailovou pozvánku. Posílání e-mailů ale znamená:
- **service-role klíč** (Supabase Admin API) → jen na serveru, nikdy do klientského bundlu,
- ověřenou doménu / SMTP, jinak pozvánky končí ve spamu.

Navrhuju MVP na **pozvánkovém odkazu s tokenem** — vlastník ho zkopíruje a pošle sám. Bezpečnostně stejné (podepsaný token, expirace, jednorázové použití), ale bez závislosti na doručování. E-mail pak přidat jako samostatnou fázi, až bude doména.

> **Zvažovaná alternativa z plánu `31_collaboration_plan.md`:** použít nativní `supabase.auth.admin.inviteUserByEmail()` a znovupoužít existující trigger `handle_new_user`. Elegantní a bez vlastní infrastruktury — ale funguje **jen pro nové uživatele**. Kolegu, který už ClearSpace účet má, tudy pozvat nelze, a nedostaneme vlastní stavy „čeká / vypršelo / odmítnuto", které zadání výslovně požaduje. Proto vlastní tabulka `invitations`; nativní odesílání se dá připojit ve fázi 8 jako doručovací kanál.

### 3.3 Poznámka k Tech Stacku
Zadání uvádí **Tailwind**. Projekt ho nepoužívá — má vlastní designový systém (`globals.css` + `design-system.css` + `.cs-*` třídy). Tailwind **nebudu zavádět**, odporovalo by to pravidlům „zachovej existující design" a „nepřepisuj fungující části".

---

## Část 4: Implementační plán

### Fáze 0 — Zprovoznění Supabase *(na tobě + ověření ode mě)*
**Cíl:** aplikace běží proti reálné databázi, ne nad localStorage.
**Změny:** založení Supabase projektu, doplnění klíčů do `.env.local`, spuštění `supabase_schema.sql`.
**Soubory:** `.env.local` (ty), případné drobné opravy schématu (já).
**Rizika:** stávající demo data se nepřenesou — začíná se s prázdnou DB.
**Proč tady:** bez databáze nelze ověřit ani jednu další fázi.

---

### Fáze 1 — Členství a RLS *(pouze databáze, žádné UI)*
**Cíl:** projekt je přístupný svým členům, ne jen vlastníkovi.
**Změny:**
- `project_members(project_id, user_id, role owner|editor, created_at)`
- přejmenování stávající tabulky na `project_assignees` + převod dat
- `SECURITY DEFINER` funkce `is_project_member(project_id)` a `is_project_owner(project_id)`
- přepis **všech** RLS politik (projects, columns, cards, checklists, comments, activities, assignees) z vlastnictví na členství
- trigger: vlastník se při založení projektu vloží jako `owner`
- trigger: **strop 10 členů vynucený v databázi**, ne v UI
**Soubory:** `supabase_schema.sql`
**Rizika:**
- **Nekonečná rekurze v RLS** — politika nad `project_members`, která se sama doptává `project_members`, v Postgresu zacyklí. Proto ty `SECURITY DEFINER` funkce; je to klasická past Supabase.
- Chyba v politice = ztráta přístupu k vlastním datům. Nasazovat na prázdné DB, ne na ostrých datech.
**Proč tady:** bezpečnostní základ. Vše ostatní na něm stojí.

---

### Fáze 2 — Přístupová vrstva v aplikaci
**Cíl:** aplikace umí říct „tohle je můj projekt / tohle je projekt, kam mě pozvali".
**Změny:** `membershipService`, hook `useProjectMembership` (role, práva), ochrana routy `/projects/[id]`, seznam projektů zobrazí i ty cizí se členstvím.
**Soubory:** `services/membershipService.ts` (nový), `hooks/useProjectMembership.ts` (nový), `services/kanbanService.ts`, `app/projects/[projectId]/page.tsx`, `components/dashboard/ProjectDashboard.tsx`
**Rizika:** `fetchProjects` dnes filtruje na `user_id`; změna musí zachovat demo větev.
**Proč tady:** bez čtení členství nemá smysl dělat pozvánky.

---

### Fáze 3 — Pozvánky
**Cíl:** dostat do projektu druhého člověka.
**Změny:** tabulka `invitations` (token, email, role, expirace, stav) + RLS, servis, stránka `/invite/[token]` s přijetím/odmítnutím, ošetření expirace a duplicit.
**Soubory:** `supabase_schema.sql`, `services/invitationService.ts` (nový), `app/invite/[token]/page.tsx` (nový)
**Rizika:** token musí být nedohadatelný a jednorázový; přijetí musí být atomické (transakce), jinak vznikne duplicitní členství.
**Proč tady:** první bod, kdy jde spolupráci reálně vyzkoušet na dvou účtech.

---

### Fáze 4 — UI členů a Project Settings
**Cíl:** vlastník spravuje tým z rozhraní.
**Změny:** sekce Project Settings → Members, dialog pozvání, zobrazení role, odebrání člena, počítadlo do 10, příprava na převod vlastnictví.
**Soubory:** `components/project/` (nové), `ProjectMembersModal.tsx` (rozšíření), `globals.css`
**Rizika:** nesmí se rozbít stávající přiřazování na kartách; Editor nesmí vidět správu členů.
**Proč tady:** UI až nad funkčním a zabezpečeným backendem.

---

### Fáze 5 — Activity feed
**Cíl:** kdo co kdy udělal.
**Změny:** tabulka `activity_logs` (actor, entita, typ akce, metadata JSONB, čas) + RLS, zápis z existujících mutací, panel v UI, struktura připravená na filtrování.
**Soubory:** `supabase_schema.sql`, `services/activityService.ts` (nový), `hooks/useKanbanBoard.ts`, `components/activity/` (nové)
**Rizika:** zápis logu nesmí zpomalit ani shodit hlavní operaci (fire-and-forget, chyba se nesmí propsat uživateli).
**Proč tady:** před realtimem — realtime pak jednou obslouží karty, sloupce **i** feed.

---

### Fáze 6 — Realtime synchronizace
**Cíl:** změny druhých lidí se objeví bez refreshe.
**Změny:** hook `useRealtimeBoard`, odběr změn `columns`/`cards`/`activity_logs` filtrovaný na projekt, slučování do stavu boardu, ignorování vlastních změn (echo), ošetření odpojení.
**Soubory:** `hooks/useRealtimeBoard.ts` (nový), `hooks/useKanbanBoard.ts`, `supabase_schema.sql` (publikace tabulek)
- **Frakční pozice karet** místo celočíselných (viz níže)
**Rizika:**
- **Konflikt pozic při souběžném drag & drop.** Karty mají dnes celočíselné `position`. Když dva lidé zároveň přesouvají karty ve stejném sloupci, přepisují si pořadí navzájem a výsledek je nedeterministický. Řeší se **frakčními pozicemi** (lexorank): nová karta dostane hodnotu mezi sousedy, takže se dva souběžné přesuny nepotkají. Malá změna schématu (`position` → `text`/`numeric`), ale nutná.
- **Zbytečné rerendery** — `useKanbanBoard` drží `Column[]` s vnořenými kartami; naivní slučování překreslí celý board při každé cizí změně. Bude potřeba cílená immutable aktualizace.
- Souběh s optimistickým UI (lokální změna vs. příchozí event).
- **`restoreProjectSnapshot`** (AI rollback) přepisuje data hromadně — ve více lidech je to destruktivní. Doporučuju ho omezit na vlastníka.

> Frakční pozice pochází z dřívějšího plánu `31_collaboration_plan.md`. V první verzi téhle analýzy chyběly — doplněno.
**Proč tady:** až nad ustálenými daty a právy.

---

### Fáze 7 — Presence
**Cíl:** vidět, kdo je online.
**Změny:** hook `usePresence` nad Supabase Presence, avatary v toolbaru, volitelně „upravuje…".
**Soubory:** `hooks/usePresence.ts` (nový), `components/toolbar/Toolbar.tsx`
**Rizika:** presence eventy chodí často — nutné omezit frekvenci, ať netrpí výkon.
**Proč tady:** kosmetická vrstva nad realtimem, nejmenší riziko.

---

### Fáze 8 — E-mailové pozvánky *(volitelné)*
**Cíl:** pozvánka dorazí sama.
**Změny:** serverová routa s service-role klíčem, šablona.
**Rizika:** service-role klíč nesmí nikdy do klientského bundlu; nutná ověřená doména.
**Proč tady:** až úplně nakonec — jediná část závislá na vnější infrastruktuře.

---

### Fáze 9 — Vynucení práv, testy, dokumentace
**Cíl:** Editor opravdu nemůže spravovat členy; regrese pohlídané.
**Změny:** kontrola práv v UI i servisech, E2E scénář pro dva uživatele, aktualizace README.
**Proč tady:** závěrečné utažení.

---

## Část 5: Souhrn rizik napříč projektem

| Riziko | Závažnost | Ošetření |
|---|---|---|
| Rekurze v RLS politikách | **vysoká** | `SECURITY DEFINER` funkce místo poddotazů |
| Chybná politika = ztráta přístupu | **vysoká** | nasazovat na prázdné DB, ověřit dvěma účty |
| Rozbití demo režimu | střední | kolaborace jen při `hasSupabaseConfig` |
| Rerendery při realtimu | střední | cílené immutable aktualizace, ne přepis pole |
| `restoreProjectSnapshot` ve více lidech | střední | omezit na vlastníka |
| Strop 10 členů obejitelný přes API | střední | trigger v databázi, ne kontrola v UI |
| Service-role klíč v klientu | **vysoká** | jen serverová routa, fáze 8 |

---

## Část 6: Co potřebuju od tebe

1. **Založit Supabase projekt** a doplnit `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` do `frontend/.env.local`. Klíče si vlož sám, já s nimi manipulovat nebudu.
2. **Rozhodnout o `project_members`** — doporučuju variantu s odděleným autorizačním a přiřazovacím modelem (část 2.2).
3. **Potvrdit pozvánky odkazem** místo e-mailu pro MVP (část 3.2).
4. **Potvrdit zachování demo režimu** (část 3.1).

Po schválení implementuju **pouze fázi 1** a zastavím se.

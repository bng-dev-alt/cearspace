# Kontrola dávky nových funkcí (AI Project Manager, Task Resources, Team Collaboration)

Kontrola ~5 000 řádků nového kódu před pushnutím. Nebyl to můj kód — procházel jsem ho jako reviewer.

## Co v dávce přibylo

| Oblast | Soubory |
|---|---|
| **AI Project Manager** | `AiProjectManagerModal`, `AiCapacityPlannerModal`, `AiDailyBriefModal`, `AiVoiceCopilotBar`, `AiModelSelector` + 5 API rout |
| **Task Resources** | `TaskResourcesSection`, `ResourceAiModal`, `resourceService` |
| **Team Collaboration** | `collaborationService`, `accept-invite/`, `UserDetailModal`, `ResetPasswordModal` |
| **Globální hledání** | `GlobalSearchModal`, `searchService` |
| **Databáze** | tabulky `invitations`, `activity_logs`, `task_resources` + RLS |
| **Testy** | 7 nových unit sad (+17 testů), 1 E2E soubor |

---

## Co jsem našel a opravil

### 1. Lint: 42 chyb → 0
Nejvíc práce. Rozpad podle druhu:

| Druh | Počet | Jak jsem to řešil |
|---|---|---|
| `any` | 22 | skutečné typy, ne potlačení |
| `setState` v efektu | 9 | jeden odstraněn úplně, zbytek doložen komentářem |
| nepoužité importy/proměnné | 8 | odstraněno |
| `prefer-const` | 8 | automaticky |
| `Cannot access variable before declared` | 1 | přesun efektu za deklaraci |

Konkrétně:
- **Web Speech API** — soubor byl plný `any`, protože API není v TS lib typech. Místo potlačení jsem **nadefinoval minimální rozhraní** té části kontraktu, kterou kód používá.
- **`onUpdateCard: updates: any`** ve třech komponentách → `Partial<Card>`, shodně s `TaskDetailDrawer`.
- **`accept-invite`** měl efekt jen na nastavení chyby při chybějícím tokenu. Token je znám už při prvním renderu, takže jsem **efekt zrušil úplně** a hodnotu odvodil v inicializaci.
- **`AiVoiceCopilotBar`** volal `stopRecording()` v efektu **nad** jeho deklarací. Runtime to přežije (efekt běží až po renderu), ale je to křehké — efekt přesunut za deklaraci.
- Do ESLint konfigurace jsem přidal konvenci **`^_` = záměrně nevyužitý argument**.

### 2. Regrese v responzivitě (tablet)
Do navbaru přibylo hledání a výběr AI modelu. Na **768 px lišta přetékala o 29 px** — zachytil to reflow test z R8.

Oprava po vzoru R2/R3: na tabletu se z hledání stane **jen ikona** (zkratka ⌘K tam stejně není po ruce) a **výběr modelu se skryje** — je dostupný i v panelu Project Intelligence, takže se o něj nepřijde.

### 3. Globální hledání bylo na mobilu nedostupné
Tlačítko žije v `.navbar-right`, který je od R3 na mobilu skrytý. Na telefonu tedy **nešlo hledání vůbec otevřít** — ⌘K tam neexistuje.

Přidáno do hamburger menu (sekce Akce) + E2E test, aby se to nevrátilo.

### 4. Nestabilní test (můj, ne váš)
Test sbaleného hera **procházel samostatně, ale padal v plné sadě**. Příčina: hero má CSS přechod a při paralelním běhu se výška měřila **uprostřed animace** (589 px místo 469). Doplněn `settled()` — ověřeno 3× v řadě.

### 5. Emoji nahrazeno ikonou
Tlačítko hledání používalo `🔍`, zbytek aplikace `lucide-react`. Sjednoceno.

---

## Na co upozorňuju (neopravoval jsem)

### `voiceCopilotService.ts` je osiřelý
Celý soubor (~100 řádků) **nikde nepoužívá aplikace ani testy**. `AiVoiceCopilotBar` nahrává přes `MediaRecorder` a posílá na `/api/ai/voice-action`; test cílí na `aiService.executeVoiceAction`. Web Speech API varianta zůstala jako neúspěšná odbočka.

Odstranil jsem nepoužitý import, **soubor jsem nechal** — nevím, jestli je to zamýšlený fallback. Smazání je na jeden příkaz.

### Přijetí pozvánky je nedokončené
`acceptInvitationToken()` pozvánku pouze **označí jako přijatou**. Nevytvoří účet ani nenapojí člena na projekt — parametry `displayName` a `password` se zahazují. Doplnil jsem k tomu komentář, protože z podpisu funkce to nebylo poznat.

Dokončení vyžaduje `service_role` klíč na serveru (viz analýza `58_…`, fáze 3).

### RLS je pořád vlastnická
Nové tabulky mají politiky, ale všechny stojí na `projects.user_id = auth.uid()`. **Druhý uživatel se k projektu nedostane**, i kdyby pozvánku přijal. Odpovídá to fázi 1 z plánu `58_…`, která zatím neproběhla.

### Typové chyby v testovacích fixturách
`npx tsc --noEmit` hlásí chyby v 8 testovacích souborech (neúplné objekty proti `Card`/`Column`). Build ani vitest to neblokuje, ale je to skrytý dluh.

---

## Stav po opravách

| | Před | Po |
|---|---|---|
| Lint | **42 chyb, 23 varování** | **0 / 0** ✅ |
| Unit testy | 117 ✅ | 117 ✅ |
| E2E | **1 padal** | **27 ✅** (3× po sobě) |
| Build | ✅ | ✅ |
| Reflow 320–1440 | **rozbité na 768** | ✅ |

Tajemství v commitu nejsou — `.env.local` je ignorovaný, jediný nález (`service_role`) byl text ve varovné hlášce.

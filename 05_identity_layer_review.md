# Review 05 -- Identity Layer & SaaS Architecture Review

Tento dokument představuje review (posouzení) a report z implementace kompletní vrstvy identity (Identity Layer), custom přihlašování a registrace, správy relací, ochrany cest (Protected Routes) a přípravy na Row Level Security v aplikaci Kanban Board.

---

## 1. Provedené změny v souborech

### Vytvořené soubory
*   [`frontend/supabase_schema.sql`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/supabase_schema.sql) – SQL DDL definice pro Supabase. Obsahuje tabulku `profiles`, trigger pro automatické zakládání profilu při registraci nového uživatele, a kompletní sadu Row Level Security (RLS) politik pro plnou datovou izolaci na úrovni projektu, sloupců a karet.
*   [`frontend/src/contexts/AuthContext.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/contexts/AuthContext.tsx) – Centrální poskytovatel stavu autentizace (`AuthContext.Provider`). Zapouzdřuje Supabase Auth API a obsahuje plně funkční asynchronní localStorage fallback (včetně simulace síťového zpoždění pro správné zobrazení loading animací) pro lokální testování bez API klíčů.
*   [`frontend/src/hooks/useAuth.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/hooks/useAuth.ts) – Custom hook pro bezpečný a pohodlný přístup ke kontextu identity. Komponenty a další služby nekomunikují se Supabase Auth napřímo.
*   [`frontend/src/components/auth/ProtectedRoute.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/auth/ProtectedRoute.tsx) – Klientský strážce cest (route guard). Během ověřování relace zobrazuje prémiovou loading obrazovku odpovídající design systému clearspace. Nepřihlášené uživatele automaticky přesměrovává na `/login`.
*   [`frontend/src/app/login/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/login/page.tsx) – Přihlašovací stránka navržená v moderním, čistém vzhledu clearspace s tmavě modrým navy panelem a inline SVG ikonami pro Google a GitHub přihlášení (bez závislosti na externích knihovnách ikon).
*   [`frontend/src/app/register/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/register/page.tsx) – Registrační stránka podporující zadání e-mailu, hesla a zobrazovaného jména. Po úspěšné registraci automaticky přihlásí uživatele a inicializuje jeho profil.
*   [`frontend/src/__tests__/auth.test.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/auth.test.tsx) – Komplexní sada 8 integračních a jednotkových testů pro ověření přihlašování, registrace, odhlášení, obnovení session po refreshu, přesměrování a datové izolace projektů.

### Změněné soubory
*   [`frontend/src/app/layout.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/layout.tsx) – Root layout byl obalen do `<AuthProvider>` a `<ProtectedRoute>`, čímž je celá aplikace zabezpečena.
*   [`frontend/src/components/layout/Navbar.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/layout/Navbar.tsx) – Integrován `useAuth`. Avatar v pravém rohu dynamicky zobrazuje iniciály přihlášeného uživatele a po kliknutí otevírá plovoucí dropdown s informacemi o účtu a tlačítkem "Odhlásit se".
*   [`frontend/src/services/kanbanService.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/kanbanService.ts) – Upraveny metody `fetchProjects` a `createProject`, aby pracovaly s identifikátorem `userId`. Pro nově registrovaného uživatele je automaticky vytvořen a naseedován výchozí projekt s dummy daty. Vyčištěna typování `any` pro dosažení 100% čistého lintu.
*   [`frontend/src/hooks/useKanbanBoard.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/hooks/useKanbanBoard.ts) – Propojen s `useAuth`. Dynamicky odvozuje `activeProjectId` na základě `user.id`. Přidána synchronní aktualizace stavu během render fáze při změně projektu pro eliminaci problikávání starých dat a zamezení kaskádovým re-renderům (vyřešena chyba `react-hooks/set-state-in-effect`).
*   [`frontend/src/components/dashboard/ProjectDashboard.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/dashboard/ProjectDashboard.tsx) – Integrována autentizace. Načítání a zakládání projektů je provázáno s `user.id`.
*   [`frontend/src/__tests__/kanban.test.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/kanban.test.tsx) – Namockován modul `../hooks/useAuth` pro zachování izolace a funkčnosti původních unit testů boardu bez nutnosti složitého wrapperu.

---

## 2. Implementace a chování

### Jak funguje správa relací (Session Management)
*   **Aktivní režim Supabase:** Systém naslouchá na kanálu `supabase.auth.onAuthStateChange`. Pokud je nalezena platná session v cookies/localStorage, klient automaticky načte data uživatele a z tabulky `profiles` vytáhne přidružený profil (včetně `display_name`).
*   **Lokální režim (fallback):** Při absenci proměnných prostředí ukládá mockovací vrstva šifrovanou/serializovanou relaci do `localStorage` pod klíčem `kanban_mock_session`. Při startu aplikace simuluje asynchronní síťový dotaz (50ms), během něhož drží stav načítání.

### Jak funguje ochrana cest (Protected Routes)
*   Komponenta `ProtectedRoute` v layoutu detekuje aktuální cestu přes `usePathname()`.
*   Cesty `/login` a `/register` jsou registrovány jako veřejné a jsou vykresleny okamžitě.
*   Při přístupu na jakoukoliv jinou adresu se zkontroluje stav autentizace. Pokud relace chybí, uživatel je bezpečně přesměrován na `/login` pomocí `router.replace('/login')` a chráněný obsah se vůbec nevykreslí (zamezení transientním flashům dat).

### Datová izolace a SaaS škálovatelnost
*   **Izolace projektů:** Každý uživatel má projekty asociované se svým `user_id`. Při načítání dashboardu vidí pouze své záznamy. Noví uživatelé obdrží izolovaný projekt `project-default-${userId}`, což zajišťuje, že žádný uživatel nevidí boardy ostatních.
*   **Row Level Security (RLS) v Supabase:** Všechny politiky jsou připraveny v souboru `supabase_schema.sql`. Povolují operace `SELECT`, `INSERT`, `UPDATE` a `DELETE` pouze tehdy, když `auth.uid() = user_id`. Pro sloupce a karty jsou politikami vyžadovány vazby přes `project_id` patřící danému uživateli, což je optimální a bezpečné produkční řešení.

---

## 3. Status

✅ **Build OK** (Next.js produkční build zkompiloval bez chyb)

✅ **Lint OK** (ESLint prošel s 0 chybami a varováními)

✅ **Tests OK** (Všech 20 testovacích scénářů Vitest prošlo)

# Multi-Project SaaS Integration Report

Tento dokument shrnuje rozbor a provedené změny pro integraci podpory více projektů do aplikace Kanban Board.

---

## 1. Co bylo implementováno

*   **Úvodní Projects Dashboard:** Stránka se seznamem všech projektů stažených z databáze (nebo `localStorage` v offline režimu) navržená v minimalistickém stylu clearspace.
*   **Vytváření a otevírání projektů:** Uživatel může přes vyskakovací modal vytvořit nový projekt, který ho automaticky přesměruje do nového rozhraní, nebo rozkliknout existující.
*   **Projektově izolované desky:** Každý projekt má svou vlastní sadu sloupců a úkolů.
*   **Offline persistence (localStorage):** V případě chybějících Supabase klíčů se seznam projektů a jejich desky ukládají do `localStorage` pod klíči `kanban_projects` a `kanban_board_${projectId}`.
*   **Zpětná navigace:** Logo clearspace a odkaz "Projekty" v navigační liště umožňují plynulý návrat na Projects Dashboard.

---

## 2. Vytvořené soubory

*   [`src/app/projects/[projectId]/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/projects/%5BprojectId%5D/page.tsx) – Dynamic page pro zobrazení specifické kanban desky.
*   [`src/components/dashboard/ProjectDashboard.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/dashboard/ProjectDashboard.tsx) – Komponenta dashboardu pro zobrazení a zakládání projektů.

---

## 3. Změněné soubory

*   [`src/app/page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/page.tsx) – Přesměrován z přímého boardu na renderování `ProjectDashboard` na kořenové cestě `/`.
*   [`src/components/layout/Navbar.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/layout/Navbar.tsx) – Logo a odkaz "Projekty" převedeny na routovací odkazy `Link` pro návrat na úvodní stránku.
*   [`src/services/kanbanService.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/kanbanService.ts) – Přidány metody `fetchProjects`, `createProject`, upraveny operace pro board, a zavedena `localStorage` persistence.
*   [`src/hooks/useKanbanBoard.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/hooks/useKanbanBoard.ts) – Hook upraven pro příjem `projectId` a synchronní sestavení sloupců.
*   [`src/__tests__/kanban.test.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/kanban.test.tsx) – Přepsán import testované desky na dynamic route a namockovány hooky `useParams` a `useRouter`.

---

## 4. Změny v architektuře

Směrování aplikace bylo rozděleno z jediné stránky na dynamické trasování (Next.js App Router):

```text
/ (Kořenová trasa) -> ProjectDashboard
      │
      └── /projects/[projectId] -> Detail konkrétního Kanban Boardu
```

Business logika je plně oddělena:
- Služby (`kanbanService.ts`) zajišťují persistence vrstvu (Supabase SQL / lokální localStorage).
- Custom hooky spravují synchronizaci stavu, přetahování a přejmenování.
- Prezentační komponenty (složka `components`) zajišťují luxusní bezstavové vykreslení rozhraní.

---

## 5. Databázové změny (SQL)

Pro plnou integraci víceklientského uložení přidej v Supabase SQL Editoru tabulku `projects` a uprav tabulku `columns`:

```sql
-- 1. Tabulka pro projekty
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Úprava existující tabulky columns pro propojení s projektem
ALTER TABLE columns ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE CASCADE;
```

---

## 6. Doporučené další milestone

1.  **Authentication (Autentizace uživatelů):** Napojení Supabase Auth pro přihlášení a registraci uživatelů.
2.  **Workspaces (Pracovní prostory):** Seskupení projektů pod pracovní prostory pro podporu týmových účtů.
3.  **Realtime Collaboration:** Aktivace realtime odběrů v databázi pro zobrazení přesunů karet ostatními uživateli v reálném čase.
4.  **User Roles & Member Invitations:** Správa přístupových oprávnění (Owner, Admin, Member, Guest).

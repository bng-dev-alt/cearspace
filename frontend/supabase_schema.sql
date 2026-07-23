-- ============================================================
-- Supabase Database Schema -- AI Workspace SaaS (Kanban)
-- Canonical schema, safe to re-run (idempotent).
-- Release 21 (Data Foundation): fixed task_activities policy,
-- added projects.team_members and cards.assignees.
-- ============================================================

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Trigger for Automatic Profile + Owner Member Creation on User Signup
-- Release 23: the new account is also inserted as its own workspace member
-- with role 'owner', linked back to the profile (profile_id). This unifies
-- the previously disconnected Profile and TeamMember identities.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_display_name TEXT;
    v_initials TEXT;
BEGIN
    v_display_name := coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (new.id, new.email, v_display_name, new.raw_user_meta_data->>'avatar_url');

    -- Odvození iniciál z prvního a posledního slova jména (max 2 znaky)
    v_initials := upper(
        left(split_part(v_display_name, ' ', 1), 1) ||
        CASE
            WHEN position(' ' in v_display_name) > 0
            THEN left(split_part(v_display_name, ' ', array_length(string_to_array(v_display_name, ' '), 1)), 1)
            ELSE ''
        END
    );

    -- Vlastník účtu jako první člen svého workspace (idempotentně)
    INSERT INTO public.workspace_members (id, owner_id, profile_id, full_name, initials, avatar_color, email, workspace_role)
    VALUES ('member-owner-' || new.id, new.id, new.id, v_display_name, v_initials, '#209dd7', new.email, 'owner')
    ON CONFLICT (id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Projects Table -- Data Isolation / Multi-tenancy
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.projects
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Release 21: team members were stored as JSONB on the project (project-only membership).
-- Release 22 keeps this column for backward compatibility / migration, but project
-- membership is now expressed via member_ids referencing workspace_members (see below).
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT NULL;

-- Release 22: project membership = references to workspace member ids (JSONB array).
-- Identity lives once in workspace_members; projects only select a subset.
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS member_ids JSONB DEFAULT NULL;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
CREATE POLICY "Users can insert their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Columns and Cards -- RLS through project ownership

ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view columns of their projects" ON public.columns;
CREATE POLICY "Users can view columns of their projects"
    ON public.columns FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.columns.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage columns of their projects" ON public.columns;
CREATE POLICY "Users can manage columns of their projects"
    ON public.columns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.columns.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- Release 21: multi-assignee list is stored as JSONB on the card.
-- Legacy assignee_name/initials/color columns keep holding the primary
-- assignee for backward compatibility (AI prompts, older data).
ALTER TABLE public.cards
ADD COLUMN IF NOT EXISTS assignees JSONB DEFAULT NULL;

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view cards of their projects" ON public.cards;
CREATE POLICY "Users can view cards of their projects"
    ON public.cards FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.columns
            JOIN public.projects ON public.projects.id = public.columns.project_id
            WHERE public.columns.id = public.cards.column_id
            AND public.projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage cards of their projects" ON public.cards;
CREATE POLICY "Users can manage cards of their projects"
    ON public.cards FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.columns
            JOIN public.projects ON public.projects.id = public.columns.project_id
            WHERE public.columns.id = public.cards.column_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 5. Task Checklists Table
CREATE TABLE IF NOT EXISTS public.task_checklists (
    id TEXT PRIMARY KEY,
    card_id TEXT REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.task_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage checklists of their projects" ON public.task_checklists;
CREATE POLICY "Users can manage checklists of their projects"
    ON public.task_checklists FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.cards
            JOIN public.columns ON public.columns.id = public.cards.column_id
            JOIN public.projects ON public.projects.id = public.columns.project_id
            WHERE public.cards.id = public.task_checklists.card_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 6. Task Comments Table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id TEXT PRIMARY KEY,
    card_id TEXT REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage comments of their projects" ON public.task_comments;
CREATE POLICY "Users can manage comments of their projects"
    ON public.task_comments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.cards
            JOIN public.columns ON public.columns.id = public.cards.column_id
            JOIN public.projects ON public.projects.id = public.columns.project_id
            WHERE public.cards.id = public.task_comments.card_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 7. Task Activities Table
-- (Release 21 fix: the original policy was missing a closing
-- parenthesis and the whole script failed to execute.)
CREATE TABLE IF NOT EXISTS public.task_activities (
    id TEXT PRIMARY KEY,
    card_id TEXT REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.task_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage activities of their projects" ON public.task_activities;
CREATE POLICY "Users can manage activities of their projects"
    ON public.task_activities FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.cards
            JOIN public.columns ON public.columns.id = public.cards.column_id
            JOIN public.projects ON public.projects.id = public.columns.project_id
            WHERE public.cards.id = public.task_activities.card_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 8. Archived and Timestamp Columns on Cards
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 9. Workspace Members (Release 22 - Workspace Collaboration)
-- The single source of member identity for the whole workspace (= the owner's account).
-- One implicit workspace per user for now; owner_id scopes the rows.
-- workspace_role is prepared for future Permissions but is NOT enforced yet.
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id TEXT PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    initials TEXT NOT NULL,
    avatar_color TEXT NOT NULL DEFAULT '#209dd7',
    email TEXT,
    workspace_role TEXT NOT NULL DEFAULT 'member' CHECK (workspace_role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Release 23: link a workspace member to a real account (profile). NULL = placeholder
-- member (a contact who has no account yet -- ready for future Invite Members).
ALTER TABLE public.workspace_members
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Optional free-text job title / role shown on the Team page.
ALTER TABLE public.workspace_members
ADD COLUMN IF NOT EXISTS job_title TEXT;

CREATE INDEX IF NOT EXISTS idx_workspace_members_owner ON public.workspace_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_profile ON public.workspace_members(profile_id);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own workspace members" ON public.workspace_members;
CREATE POLICY "Users can manage their own workspace members"
    ON public.workspace_members FOR ALL
    USING (auth.uid() = owner_id);

-- 10. Project Members (Release 23) -- relational membership.
-- Replaces the projects.member_ids JSONB array with a proper join table.
CREATE TABLE IF NOT EXISTS public.project_members (
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    member_id TEXT REFERENCES public.workspace_members(id) ON DELETE CASCADE NOT NULL,
    project_role TEXT NOT NULL DEFAULT 'member' CHECK (project_role IN ('owner', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (project_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage members of their projects" ON public.project_members;
CREATE POLICY "Users can manage members of their projects"
    ON public.project_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.project_members.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 11. Card Assignees (Release 23) -- relational assignment.
-- Replaces the cards.assignees JSONB array with a proper join table.
CREATE TABLE IF NOT EXISTS public.card_assignees (
    card_id TEXT REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
    member_id TEXT REFERENCES public.workspace_members(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (card_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_card_assignees_card ON public.card_assignees(card_id);

ALTER TABLE public.card_assignees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage assignees of their projects" ON public.card_assignees;
CREATE POLICY "Users can manage assignees of their projects"
    ON public.card_assignees FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.cards
            JOIN public.columns ON public.columns.id = public.cards.column_id
            JOIN public.projects ON public.projects.id = public.columns.project_id
            WHERE public.cards.id = public.card_assignees.card_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 13. Project Invitations (Team Collaboration v1.2)
CREATE TABLE IF NOT EXISTS public.invitations (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invitations_project ON public.invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invitations for their email or projects" ON public.invitations;
CREATE POLICY "Users can view invitations for their email or projects"
    ON public.invitations FOR SELECT
    USING (
        auth.jwt() ->> 'email' = email
        OR EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.invitations.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Project owners can manage invitations" ON public.invitations;
CREATE POLICY "Project owners can manage invitations"
    ON public.invitations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.invitations.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 14. Activity Logs (Team Collaboration v1.2)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    card_id TEXT REFERENCES public.cards(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_project ON public.activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view activity logs of their projects" ON public.activity_logs;
CREATE POLICY "Users can view activity logs of their projects"
    ON public.activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.activity_logs.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert activity logs for their projects" ON public.activity_logs;
CREATE POLICY "Users can insert activity logs for their projects"
    ON public.activity_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.activity_logs.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 15. Task Resources (Task Resources v1)
CREATE TABLE IF NOT EXISTS public.task_resources (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_resources_task ON public.task_resources(task_id);

ALTER TABLE public.task_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage task resources of their projects" ON public.task_resources;
CREATE POLICY "Users can manage task resources of their projects"
    ON public.task_resources FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.cards
            JOIN public.columns ON public.columns.id = public.cards.column_id
            JOIN public.projects ON public.projects.id = public.columns.project_id
            WHERE public.cards.id = public.task_resources.task_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 12. One-time backfill migration from JSONB -> relational join tables (idempotent).
-- Safe to run repeatedly; existing rows are skipped via ON CONFLICT.
DO $$
DECLARE
    proj RECORD;
    crd RECORD;
    mid TEXT;
BEGIN
    -- projects.member_ids -> project_members
    FOR proj IN SELECT id, member_ids FROM public.projects WHERE member_ids IS NOT NULL LOOP
        FOR mid IN SELECT jsonb_array_elements_text(proj.member_ids) LOOP
            IF EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.id = mid) THEN
                INSERT INTO public.project_members (project_id, member_id)
                VALUES (proj.id, mid)
                ON CONFLICT (project_id, member_id) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;

    -- cards.assignees (array of member objects) -> card_assignees
    FOR crd IN SELECT id, assignees FROM public.cards WHERE assignees IS NOT NULL LOOP
        INSERT INTO public.card_assignees (card_id, member_id, position)
        SELECT crd.id, elem->>'id', (ord - 1)
        FROM jsonb_array_elements(crd.assignees) WITH ORDINALITY AS t(elem, ord)
        WHERE EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.id = elem->>'id')
        ON CONFLICT (card_id, member_id) DO NOTHING;
    END LOOP;
END $$;


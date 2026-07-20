import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { TeamMember } from '../types/kanban';
import { DEFAULT_MEMBERS } from '../data/dummyData';
import { persistenceStatus } from './persistence';

/**
 * Workspace Members (Release 22).
 *
 * Jediný zdroj identity člověka pro celý workspace (= účet vlastníka).
 * Projekty na tuto identitu pouze odkazují přes memberIds -- nevytvářejí kopie.
 *
 * Persistence:
 *  - Demo režim: localStorage klíč `kanban_workspace_members`.
 *  - Supabase režim: tabulka `workspace_members` (owner_id scoped).
 */

const WORKSPACE_KEY = 'kanban_workspace_members';

interface DbWorkspaceMember {
  id: string;
  owner_id: string | null;
  profile_id: string | null;
  full_name: string;
  initials: string;
  avatar_color: string;
  email: string | null;
  job_title: string | null;
  workspace_role: 'owner' | 'admin' | 'member' | null;
  created_at: string;
}

function mapDbMember(row: DbWorkspaceMember): TeamMember {
  return {
    id: row.id,
    fullName: row.full_name,
    initials: row.initials,
    avatarColor: row.avatar_color,
    email: row.email ?? undefined,
    profileId: row.profile_id ?? undefined,
    role: row.job_title ?? undefined,
    workspaceRole: row.workspace_role ?? 'member',
    createdAt: row.created_at,
  };
}

function memberToDbRow(member: TeamMember, ownerId?: string) {
  return {
    id: member.id,
    owner_id: ownerId ?? null,
    profile_id: member.profileId ?? null,
    full_name: member.fullName,
    initials: member.initials,
    avatar_color: member.avatarColor,
    email: member.email ?? null,
    job_title: member.role ?? null,
    workspace_role: member.workspaceRole ?? 'member',
    created_at: member.createdAt,
  };
}

/** Odvodí iniciály: 1 slovo -> první 2 písmena, více slov -> první + poslední. */
export function deriveInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Release 23 -- sjednocení identity: přihlášený účet (profil) jako člen
 * svého workspace s rolí owner. Id je deterministické, takže se člen
 * nezaloží podruhé (idempotentní union přes ensureMembers).
 */
export function ownerMemberFromProfile(profile: {
  id: string;
  display_name?: string;
  email?: string;
  created_at?: string;
}): TeamMember {
  const name = profile.display_name || profile.email?.split('@')[0] || 'Vlastník';
  return {
    id: `member-owner-${profile.id}`,
    fullName: name,
    initials: deriveInitials(name),
    avatarColor: '#209dd7',
    email: profile.email,
    profileId: profile.id,
    workspaceRole: 'owner',
    createdAt: profile.created_at ?? new Date().toISOString(),
  };
}

// --- Local (demo) storage ---

function readLocal(): TeamMember[] | null {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(WORKSPACE_KEY);
  return stored ? (JSON.parse(stored) as TeamMember[]) : null;
}

function writeLocal(members: TeamMember[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(members));
  }
}

function seededDefaults(): TeamMember[] {
  return DEFAULT_MEMBERS.map((m) => ({ ...m, workspaceRole: 'member' as const }));
}

export const workspaceService = {
  async fetchMembers(ownerId?: string): Promise<TeamMember[]> {
    if (!hasSupabaseConfig) {
      const local = readLocal();
      if (local && local.length > 0) return local;
      const defaults = seededDefaults();
      writeLocal(defaults);
      return defaults;
    }

    try {
      let query = supabase.from('workspace_members').select('*');
      if (ownerId) query = query.eq('owner_id', ownerId);
      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;

      if (!data || data.length === 0) {
        // První načtení: naseedovat výchozí členy workspace
        const defaults = seededDefaults();
        const { error: insertError } = await supabase
          .from('workspace_members')
          .insert(defaults.map((m) => memberToDbRow(m, ownerId)));
        if (insertError) throw insertError;
        return defaults;
      }

      persistenceStatus.clear();
      return (data as DbWorkspaceMember[]).map(mapDbMember);
    } catch (error) {
      persistenceStatus.report('načtení členů workspace', error);
      const local = readLocal();
      return local && local.length > 0 ? local : seededDefaults();
    }
  },

  async addMember(ownerId: string | undefined, data: Omit<TeamMember, 'id' | 'createdAt'>): Promise<TeamMember> {
    const newMember: TeamMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: data.fullName,
      initials: data.initials,
      avatarColor: data.avatarColor,
      email: data.email,
      role: data.role,
      workspaceRole: data.workspaceRole ?? 'member',
      createdAt: new Date().toISOString(),
    };

    if (!hasSupabaseConfig) {
      const members = readLocal() ?? seededDefaults();
      writeLocal([...members, newMember]);
      return newMember;
    }

    try {
      const { error } = await supabase
        .from('workspace_members')
        .insert(memberToDbRow(newMember, ownerId));
      if (error) throw error;
      persistenceStatus.clear();
      return newMember;
    } catch (error) {
      persistenceStatus.report('přidání člena workspace', error);
      throw error;
    }
  },

  async updateMember(ownerId: string | undefined, member: TeamMember): Promise<TeamMember> {
    if (!hasSupabaseConfig) {
      const members = readLocal() ?? seededDefaults();
      writeLocal(members.map((m) => (m.id === member.id ? member : m)));
      return member;
    }

    try {
      const { error } = await supabase
        .from('workspace_members')
        .update(memberToDbRow(member, ownerId))
        .eq('id', member.id);
      if (error) throw error;
      persistenceStatus.clear();
      return member;
    } catch (error) {
      persistenceStatus.report('úprava člena workspace', error);
      throw error;
    }
  },

  async removeMember(ownerId: string | undefined, memberId: string): Promise<void> {
    if (!hasSupabaseConfig) {
      const members = readLocal() ?? seededDefaults();
      writeLocal(members.filter((m) => m.id !== memberId));
      return;
    }

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
      persistenceStatus.clear();
    } catch (error) {
      persistenceStatus.report('odebrání člena workspace', error);
      throw error;
    }
  },

  /**
   * Union-add: doplní členy, kteří ve workspace ještě nejsou (dle id).
   * Slouží k migraci starších projektů z R21, které měly vlastní členy
   * uložené na projektu (team_members), do sdíleného workspace.
   */
  async ensureMembers(ownerId: string | undefined, members: TeamMember[]): Promise<TeamMember[]> {
    if (members.length === 0) return this.fetchMembers(ownerId);

    const existing = await this.fetchMembers(ownerId);
    const existingIds = new Set(existing.map((m) => m.id));
    const missing = members.filter((m) => !existingIds.has(m.id));
    if (missing.length === 0) return existing;

    if (!hasSupabaseConfig) {
      const merged = [...existing, ...missing];
      writeLocal(merged);
      return merged;
    }

    try {
      const { error } = await supabase
        .from('workspace_members')
        .insert(missing.map((m) => memberToDbRow({ ...m, workspaceRole: m.workspaceRole ?? 'member' }, ownerId)));
      if (error) throw error;
      persistenceStatus.clear();
      return [...existing, ...missing];
    } catch (error) {
      persistenceStatus.report('migrace členů do workspace', error);
      return existing;
    }
  },
};

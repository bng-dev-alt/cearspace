'use client';

import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from '../types/kanban';
import { workspaceService, ownerMemberFromProfile } from '../services/workspaceService';
import { kanbanService } from '../services/kanbanService';
import { useAuth } from './useAuth';

/**
 * Správa členů Workspace nezávislá na projektu (pro stránku /team).
 * Načte členy, zajistí přítomnost vlastníka (owner) z profilu, dopočítá
 * počet projektů u každého člena a poskytne CRUD operace.
 */
export function useWorkspaceMembers() {
  const { user, profile } = useAuth();
  const ownerIdArg = !user?.id || user.id === 'guest' ? undefined : user.id;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        let ws = await workspaceService.fetchMembers(ownerIdArg);

        // Zajisti, že přihlášený účet je členem workspace (owner)
        if (profile) {
          const owner = ownerMemberFromProfile(profile);
          if (!ws.some((m) => m.id === owner.id)) {
            ws = await workspaceService.ensureMembers(ownerIdArg, [owner]);
          }
        }

        // Dopočítej, v kolika projektech je každý člen
        const projects = await kanbanService.fetchProjects(user?.id);
        const counts: Record<string, number> = {};
        for (const p of projects) {
          const ids = p.memberIds ?? (p.teamMembers ?? []).map((m) => m.id);
          for (const id of ids) counts[id] = (counts[id] || 0) + 1;
        }

        if (active) {
          setMembers(ws);
          setProjectCounts(counts);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Nepodařilo se načíst členy.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [ownerIdArg, user?.id, profile]);

  const addMember = useCallback(
    async (data: Omit<TeamMember, 'id' | 'createdAt'>) => {
      const created = await workspaceService.addMember(ownerIdArg, data);
      setMembers((prev) => [...prev, created]);
      return created;
    },
    [ownerIdArg]
  );

  const editMember = useCallback(
    async (member: TeamMember) => {
      const updated = await workspaceService.updateMember(ownerIdArg, member);
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      return updated;
    },
    [ownerIdArg]
  );

  const deleteMember = useCallback(
    async (memberId: string) => {
      await workspaceService.removeMember(ownerIdArg, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    },
    [ownerIdArg]
  );

  const ownerProfileId = profile?.id;

  return { members, projectCounts, isLoading, error, ownerProfileId, addMember, editMember, deleteMember };
}

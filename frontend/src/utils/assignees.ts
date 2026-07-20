import { Assignee, Column, TeamMember } from '../types/kanban';

/**
 * Jediné místo v aplikaci, kde se mapuje mezi novým modelem
 * (Card.assignees: TeamMember[]) a legacy modelem (Card.assignee: Assignee).
 * Release 22 tento legacy model nahradí relací na profily.
 */

export function toPrimaryAssignee(members?: TeamMember[] | null): Assignee | undefined {
  if (!members || members.length === 0) return undefined;
  const primary = members[0];
  return {
    name: primary.fullName,
    initials: primary.initials,
    color: primary.avatarColor,
  };
}

export function legacyAssigneeToMember(assignee: Assignee): TeamMember {
  return {
    id: 'member-fallback',
    fullName: assignee.name,
    initials: assignee.initials,
    avatarColor: assignee.color,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Re-resolvuje řešitele karty proti autoritativnímu seznamu členů (Release 22).
 * - členům, kteří v seznamu existují, obnoví aktuální jméno/barvu (identita žije jednou),
 * - členy, kteří v seznamu už nejsou, vyřadí (např. odebrání z projektu),
 * - legacy fallback řešitele (bez vazby na identitu) ponechá.
 * Pokud seznam ještě není načtený (prázdný), vrací řešitele beze změny.
 */
export function resolveAssignees(
  assignees: TeamMember[] | undefined,
  members: TeamMember[]
): TeamMember[] {
  if (!assignees || assignees.length === 0) return [];
  if (members.length === 0) return assignees;
  const byId = new Map(members.map((m) => [m.id, m]));
  return assignees
    .filter((a) => byId.has(a.id) || a.id === 'member-fallback')
    .map((a) => byId.get(a.id) ?? a);
}

/** Aplikuje resolveAssignees na všechny karty boardu a udrží legacy pole assignee v synchronu. */
export function resolveBoardAssignees(columns: Column[], members: TeamMember[]): Column[] {
  if (members.length === 0) return columns;
  return columns.map((col) => ({
    ...col,
    cards: col.cards.map((card) => {
      if (!card.assignees || card.assignees.length === 0) return card;
      const resolved = resolveAssignees(card.assignees, members);
      return { ...card, assignees: resolved, assignee: toPrimaryAssignee(resolved) };
    }),
  }));
}

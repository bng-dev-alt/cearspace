import { describe, test, expect } from 'vitest';
import { toPrimaryAssignee, legacyAssigneeToMember } from '../utils/assignees';
import { TeamMember } from '../types/kanban';

describe('Assignee mapping utils (Release 21)', () => {
  const members: TeamMember[] = [
    {
      id: 'member-1',
      fullName: 'Alex Rivera',
      initials: 'AR',
      avatarColor: '#209dd7',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'member-2',
      fullName: 'Sarah Chen',
      initials: 'SC',
      avatarColor: '#753991',
      createdAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  test('toPrimaryAssignee returns first member as legacy assignee', () => {
    const primary = toPrimaryAssignee(members);
    expect(primary).toEqual({ name: 'Alex Rivera', initials: 'AR', color: '#209dd7' });
  });

  test('toPrimaryAssignee returns undefined for empty or missing list', () => {
    expect(toPrimaryAssignee([])).toBeUndefined();
    expect(toPrimaryAssignee(undefined)).toBeUndefined();
    expect(toPrimaryAssignee(null)).toBeUndefined();
  });

  test('legacyAssigneeToMember converts legacy assignee to a fallback member', () => {
    const member = legacyAssigneeToMember({ name: 'Jane Doe', initials: 'JD', color: '#ffffff' });
    expect(member.id).toBe('member-fallback');
    expect(member.fullName).toBe('Jane Doe');
    expect(member.initials).toBe('JD');
    expect(member.avatarColor).toBe('#ffffff');
    expect(member.createdAt).toBeDefined();
  });

  test('round-trip keeps primary assignee stable', () => {
    const primary = toPrimaryAssignee(members)!;
    const roundTripped = toPrimaryAssignee([legacyAssigneeToMember(primary)]);
    expect(roundTripped).toEqual(primary);
  });
});

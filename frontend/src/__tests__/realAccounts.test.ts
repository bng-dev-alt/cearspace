import { describe, test, expect, beforeEach } from 'vitest';
import { workspaceService, ownerMemberFromProfile, deriveInitials } from '../services/workspaceService';

/**
 * Release 23 -- Real Accounts + relational model.
 * Ověřuje sjednocení identity (přihlášený účet = owner člen workspace).
 */

describe('Identity unification (owner member from profile)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('deriveInitials handles one and two-word names', () => {
    expect(deriveInitials('Michael Beneš')).toBe('MB');
    expect(deriveInitials('Alex')).toBe('AL');
    expect(deriveInitials('  jan   novak ')).toBe('JN');
    expect(deriveInitials('')).toBe('?');
  });

  test('ownerMemberFromProfile builds a deterministic owner member linked to the profile', () => {
    const profile = {
      id: 'user-123',
      display_name: 'Michael Beneš',
      email: 'michael@example.com',
      created_at: '2026-01-01T00:00:00.000Z',
    };
    const owner = ownerMemberFromProfile(profile);
    expect(owner.id).toBe('member-owner-user-123');
    expect(owner.fullName).toBe('Michael Beneš');
    expect(owner.initials).toBe('MB');
    expect(owner.email).toBe('michael@example.com');
    expect(owner.profileId).toBe('user-123');
    expect(owner.workspaceRole).toBe('owner');
  });

  test('owner member id is stable, so ensureMembers never duplicates it', async () => {
    await workspaceService.fetchMembers(); // seed 4 defaults
    const owner = ownerMemberFromProfile({ id: 'user-123', display_name: 'Michael Beneš' });

    const first = await workspaceService.ensureMembers(undefined, [owner]);
    expect(first.length).toBe(5);
    expect(first.some((m) => m.id === owner.id && m.workspaceRole === 'owner')).toBe(true);

    // Podruhé se nesmí přidat znovu
    const second = await workspaceService.ensureMembers(undefined, [owner]);
    expect(second.length).toBe(5);
    expect(second.filter((m) => m.id === owner.id).length).toBe(1);
  });

  test('owner member survives a reload (persisted in workspace list)', async () => {
    const owner = ownerMemberFromProfile({ id: 'user-9', display_name: 'Petra Nováková' });
    await workspaceService.fetchMembers();
    await workspaceService.ensureMembers(undefined, [owner]);

    const reloaded = await workspaceService.fetchMembers();
    const found = reloaded.find((m) => m.id === owner.id);
    expect(found).toBeDefined();
    expect(found!.profileId).toBe('user-9');
    expect(found!.workspaceRole).toBe('owner');
  });
});

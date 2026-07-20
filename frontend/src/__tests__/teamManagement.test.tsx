import { describe, test, expect, beforeEach } from 'vitest';
import { workspaceService } from '../services/workspaceService';
import { kanbanService } from '../services/kanbanService';
import { promptBuilder } from '../services/ai/promptBuilder';
import { resolveBoardAssignees } from '../utils/assignees';
import { TeamMember, Card, Column } from '../types/kanban';

/**
 * Release 22 -- Workspace Collaboration.
 * Dvě úrovně členství: Workspace (identita) a Projekt (výběr z workspace).
 */

describe('Workspace members (identity)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('seeds default workspace members on first fetch', async () => {
    const members = await workspaceService.fetchMembers();
    expect(members.length).toBe(4);
    expect(members[0].fullName).toBe('Alex Rivera');
    expect(members[0].workspaceRole).toBe('member');
  });

  test('add / edit / delete workspace member', async () => {
    await workspaceService.fetchMembers(); // seed defaults

    const created = await workspaceService.addMember(undefined, {
      fullName: 'John Doe',
      initials: 'JD',
      avatarColor: '#f43f5e',
      email: 'john.doe@example.com',
    });
    expect(created.id).toBeDefined();
    expect(created.createdAt).toBeDefined();

    let all = await workspaceService.fetchMembers();
    expect(all.length).toBe(5);
    expect(all.some((m) => m.fullName === 'John Doe')).toBe(true);

    await workspaceService.updateMember(undefined, {
      ...created,
      fullName: 'Johnathan Doe',
      initials: 'JN',
    });
    all = await workspaceService.fetchMembers();
    expect(all.find((m) => m.id === created.id)!.fullName).toBe('Johnathan Doe');

    await workspaceService.removeMember(undefined, created.id);
    all = await workspaceService.fetchMembers();
    expect(all.length).toBe(4);
    expect(all.some((m) => m.id === created.id)).toBe(false);
  });

  test('ensureMembers unions legacy members without duplicating existing ids', async () => {
    await workspaceService.fetchMembers(); // 4 defaults
    const legacy: TeamMember[] = [
      // existující id -> nemá se duplikovat
      { id: 'member-1', fullName: 'Alex Rivera', initials: 'AR', avatarColor: '#209dd7', createdAt: '2026-01-01T00:00:00.000Z' },
      // nové id -> má se přidat
      { id: 'legacy-9', fullName: 'Legacy Person', initials: 'LP', avatarColor: '#000000', createdAt: '2026-01-01T00:00:00.000Z' },
    ];
    const merged = await workspaceService.ensureMembers(undefined, legacy);
    expect(merged.length).toBe(5);
    expect(merged.filter((m) => m.id === 'member-1').length).toBe(1);
    expect(merged.some((m) => m.id === 'legacy-9')).toBe(true);
  });
});

describe('Project membership (selection from workspace)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('new project defaults to all default members and can be narrowed', async () => {
    const project = await kanbanService.createProject('Alpha', 'user-1');
    expect(project.memberIds).toBeDefined();
    expect(project.memberIds!.length).toBe(4);

    await kanbanService.setProjectMembers(project.id, ['member-1', 'member-2']);

    const reloaded = await kanbanService.fetchProjectById(project.id);
    expect(reloaded!.memberIds).toEqual(['member-1', 'member-2']);
  });

  test('two projects keep independent membership', async () => {
    const a = await kanbanService.createProject('A', 'user-1');
    const b = await kanbanService.createProject('B', 'user-1');

    await kanbanService.setProjectMembers(a.id, ['member-1']);
    await kanbanService.setProjectMembers(b.id, ['member-2', 'member-3']);

    const ra = await kanbanService.fetchProjectById(a.id);
    const rb = await kanbanService.fetchProjectById(b.id);
    expect(ra!.memberIds).toEqual(['member-1']);
    expect(rb!.memberIds).toEqual(['member-2', 'member-3']);
  });
});

describe('Task assignment is restricted to project members', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('resolveBoardAssignees drops assignees who are not project members', async () => {
    const workspace = await workspaceService.fetchMembers(); // 4 defaults
    const projectMembers = workspace.filter((m) => ['member-1', 'member-2'].includes(m.id));

    const columns: Column[] = [
      {
        id: 'c1',
        name: 'A',
        cards: [
          {
            id: 'card-1',
            title: 'T',
            details: '',
            // member-1 je v projektu, member-3 není
            assignees: [workspace[0], workspace[2]],
          },
        ],
      },
    ];

    const resolved = resolveBoardAssignees(columns, projectMembers);
    const card = resolved[0].cards[0];
    expect(card.assignees!.map((a) => a.id)).toEqual(['member-1']);
    expect(card.assignee!.name).toBe('Alex Rivera');
  });

  test('editing a workspace member refreshes assignee identity on resolve', async () => {
    const workspace = await workspaceService.fetchMembers();
    const renamed: TeamMember = { ...workspace[0], fullName: 'Alex Rivers', initials: 'AV' };
    const projectMembers = [renamed, workspace[1]];

    const columns: Column[] = [
      { id: 'c1', name: 'A', cards: [{ id: 'card-1', title: 'T', details: '', assignees: [workspace[0]] }] },
    ];

    const resolved = resolveBoardAssignees(columns, projectMembers);
    expect(resolved[0].cards[0].assignees![0].fullName).toBe('Alex Rivers');
    expect(resolved[0].cards[0].assignees![0].initials).toBe('AV');
    expect(resolved[0].cards[0].assignee!.name).toBe('Alex Rivers');
  });
});

describe('AI prompt compatibility with multi-assignee', () => {
  test('promptBuilder is compatible with the multi-assignee structure', () => {
    const teamMember: TeamMember = {
      id: 'member-123',
      fullName: 'Jane Doe',
      initials: 'JD',
      avatarColor: '#ffffff',
      createdAt: new Date().toISOString(),
    };

    const card: Card = {
      id: 'card-123',
      title: 'AI Compatible Card',
      details: 'Detail text description',
      assignee: { name: 'Jane Doe', initials: 'JD', color: '#ffffff' },
      assignees: [teamMember],
      checklist: [],
      comments: [],
      activities: [],
    };

    const formattedText = promptBuilder.buildTaskImprovePrompt(card);
    expect(formattedText).toBeDefined();
    const userMessageContent = formattedText.find((m) => m.role === 'user')!.content;
    expect(userMessageContent).toContain('Jane Doe');
    expect(userMessageContent).toContain('AI Compatible Card');
  });
});

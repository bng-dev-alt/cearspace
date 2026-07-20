import { describe, test, expect } from 'vitest';
import { computeProjectIntelligence } from '../lib/projectIntelligence';
import type { Card, Column } from '../types/kanban';

function card(id: string, extra: Partial<Card> = {}): Card {
  return { id, title: `Karta ${id}`, details: '', ...extra };
}

function board(cols: { name: string; cards: Card[] }[]): Column[] {
  return cols.map((c, i) => ({ id: `column-${i + 1}`, name: c.name, cards: c.cards }));
}

const NOW = new Date('2026-07-20T10:00:00Z');

describe('computeProjectIntelligence', () => {
  test('prázdný projekt → insight "empty" a akce generate', () => {
    const intel = computeProjectIntelligence(board([{ name: 'Nápady', cards: [] }]), NOW);
    expect(intel.insights.some((i) => i.id === 'empty')).toBe(true);
    expect(intel.actions).toContain('generate');
    expect(intel.health.level).toBe('healthy'); // prázdno není nezdravé, jen prázdné
  });

  test('blokovaný úkol → danger insight, akce blockers je první, skóre klesá', () => {
    const intel = computeProjectIntelligence(
      board([
        { name: 'V průběhu', cards: [card('a', { tag: 'Blokováno', assignees: [] })] },
        { name: 'Hotovo', cards: [] },
      ]),
      NOW
    );
    const blocked = intel.insights.find((i) => i.id === 'blocked');
    expect(blocked?.severity).toBe('danger');
    expect(intel.actions[0]).toBe('blockers');
    expect(intel.health.score).toBeLessThan(100);
    expect(intel.health.breakdown.some((b) => b.label === 'Blokátory')).toBe(true);
  });

  test('úkol po termínu se detekuje podle injektovaného času a nepočítá se v Hotovo', () => {
    const intel = computeProjectIntelligence(
      board([
        { name: 'V průběhu', cards: [card('late', { dueDate: '2026-07-10', assignees: [{ id: 'm', fullName: 'X', initials: 'X', avatarColor: '#000', createdAt: '' }] })] },
        { name: 'Hotovo', cards: [card('done', { dueDate: '2026-07-01' })] },
      ]),
      NOW
    );
    const overdue = intel.insights.find((i) => i.id === 'overdue');
    expect(overdue).toBeTruthy();
    expect(overdue?.fact).toContain('1');
  });

  test('zdravý projekt s přiřazením a termínem → level healthy, žádný danger', () => {
    const assignee = { id: 'm', fullName: 'X', initials: 'X', avatarColor: '#000', createdAt: '' };
    const intel = computeProjectIntelligence(
      board([
        { name: 'V průběhu', cards: [card('a', { dueDate: '2026-08-01', priority: 'High', assignees: [assignee] })] },
        { name: 'Hotovo', cards: [card('b', { assignees: [assignee] })] },
      ]),
      NOW
    );
    expect(intel.health.level).toBe('healthy');
    expect(intel.insights.some((i) => i.severity === 'danger')).toBe(false);
  });
});

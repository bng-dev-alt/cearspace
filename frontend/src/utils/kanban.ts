import { Column } from '../types/kanban';

export function translatePriority(p?: 'Low' | 'Medium' | 'High'): string {
  if (p === 'High') return 'Vysoká';
  if (p === 'Medium') return 'Střední';
  return 'Nízká';
}

export function getPriorityColor(p?: 'Low' | 'Medium' | 'High'): string {
  if (p === 'High') return 'var(--danger)';
  if (p === 'Medium') return 'var(--accent-yellow)';
  return 'var(--blue-primary)';
}

export function isTagUsed(columns: Column[], tag: string): boolean {
  return columns.some((col) => col.cards.some((card) => card.tag === tag));
}

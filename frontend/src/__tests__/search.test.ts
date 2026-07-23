import { describe, it, expect } from 'vitest';
import { searchService } from '../services/searchService';
import { Column, TaskResource } from '../types/kanban';

describe('Global Search Service Unit Tests', () => {
  const mockColumns: Column[] = [
    {
      id: 'col-todo',
      name: 'K zapracování',
      cards: [
        {
          id: 'c-1',
          title: 'Implementovat 2FA autentizaci',
          details: 'Přidat dvoufázové ověřování přes TOTP a Google Authenticator.',
          tag: 'security',
          checklist: [{ id: 'item-1', text: 'Nainstalovat qrcode balíček', completed: false }],
        },
        {
          id: 'c-2',
          title: 'Optimalizace databáze',
          details: 'Přidat indexy na tabulku activity_logs.',
          tag: 'database',
        },
      ],
    },
  ];

  const mockResources: TaskResource[] = [
    {
      id: 'res-1',
      taskId: 'c-1',
      filename: 'specifikace_2fa.pdf',
      storagePath: 'res-1.pdf',
      size: 1024,
      mimeType: 'application/pdf',
      uploadedBy: 'Jan Novák',
      createdAt: '2026-01-01',
    },
  ];

  it('returns high score for exact card title match', () => {
    const results = searchService.searchBoardData('Implementovat 2FA autentizaci', mockColumns, mockResources);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Implementovat 2FA autentizaci');
    expect(results[0].score).toBeGreaterThanOrEqual(100);
  });

  it('searches inside card details and checklist items', () => {
    const results = searchService.searchBoardData('qrcode', mockColumns, mockResources);
    expect(results).toHaveLength(1);
    expect(results[0].snippet).toContain('qrcode');
  });

  it('searches inside task resource filenames', () => {
    const results = searchService.searchBoardData('specifikace', mockColumns, mockResources);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('resource');
    expect(results[0].title).toBe('specifikace_2fa.pdf');
  });

  it('returns empty array when query is whitespace', () => {
    const results = searchService.searchBoardData('   ', mockColumns, mockResources);
    expect(results).toHaveLength(0);
  });
});

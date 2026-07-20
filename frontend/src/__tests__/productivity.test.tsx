import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useKanbanBoard } from '../hooks/useKanbanBoard';
import ProjectBoardPage from '../app/projects/[projectId]/page';

// Mock useParams, useRouter, usePathname
vi.mock('next/navigation', () => ({
  useParams: () => ({ projectId: 'project-default' }),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/projects/project-default',
}));

// Mock auth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    profile: { id: 'test-user-id', email: 'test@example.com', display_name: 'Test Uživatel' },
  }),
}));

vi.mock('../services/kanbanService', () => ({
  kanbanService: {
    fetchBoardData: vi.fn().mockImplementation(() => Promise.resolve([])),
    fetchProjectById: vi.fn().mockImplementation(() => Promise.resolve({ id: 'project-default', name: 'Vývoj MVP' })),
    createCard: vi.fn(),
    updateCard: vi.fn(),
    archiveCard: vi.fn(),
    deleteCard: vi.fn(),
    addActivity: vi.fn(),
    addChecklistItem: vi.fn(),
    updateChecklistItem: vi.fn(),
    deleteChecklistItem: vi.fn(),
    addComment: vi.fn(),
  }
}));

// Test harness to capture useKanbanBoard hook values
let capturedHook: ReturnType<typeof useKanbanBoard> | null = null;
function TestBoardHarness() {
  const hookVal = useKanbanBoard('project-default');
  React.useEffect(() => {
    capturedHook = hookVal;
  });
  return <div data-testid="harness">Harness Loaded</div>;
}

describe('Kanban Productivity & Advanced Filters Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    capturedHook = null;
    vi.clearAllMocks();
  });

  test('Global keyboard shortcuts are registered and triggered correctly', () => {
    render(<ProjectBoardPage />);
    
    // Check page loaded
    expect(screen.getByTestId('search-input')).toBeInTheDocument();

    // Trigger keyboard shortcut '/' to focus search input
    const searchInput = screen.getByTestId('search-input') as HTMLInputElement;
    fireEvent.keyDown(window, { key: '/' });
    expect(document.activeElement).toBe(searchInput);

    // Trigger keyboard shortcut 'Esc' to blur and close
    fireEvent.keyDown(searchInput, { key: 'Escape' });
    expect(document.activeElement).not.toBe(searchInput);
  });

  test('Search and filter engine in getProcessedColumns hook', () => {
    render(<TestBoardHarness />);
    expect(screen.getByTestId('harness')).toBeInTheDocument();

    // The initial hook loads dummy data columns
    expect(capturedHook).not.toBeNull();

    // 1. Verify Global Search
    // Search matching title: "mockup"
    let cols = capturedHook!.getProcessedColumns('mockup', {}, '');
    const totalCards = cols.reduce((acc, col) => acc + col.cards.length, 0);
    expect(totalCards).toBeGreaterThan(0);
    cols.forEach(col => {
      col.cards.forEach(card => {
        expect(card.title.toLowerCase() + card.details.toLowerCase()).toContain('mockup');
      });
    });

    // 2. Verify Advanced Filters - Priority
    cols = capturedHook!.getProcessedColumns('', { priority: 'High' }, '');
    cols.forEach(col => {
      col.cards.forEach(card => {
        expect(card.priority).toBe('High');
      });
    });

    // 3. Verify Advanced Filters - Assignee
    cols = capturedHook!.getProcessedColumns('', { assignee: 'Alex Rivera' }, '');
    cols.forEach(col => {
      col.cards.forEach(card => {
        expect(card.assignee?.name).toBe('Alex Rivera');
      });
    });

    // 4. Verify Advanced Filters - Checklist Presence
    cols = capturedHook!.getProcessedColumns('', { hasChecklist: 'yes' }, '');
    cols.forEach(col => {
      col.cards.forEach(card => {
        expect(card.checklist?.length).toBeGreaterThan(0);
      });
    });

    cols = capturedHook!.getProcessedColumns('', { hasChecklist: 'no' }, '');
    cols.forEach(col => {
      col.cards.forEach(card => {
        expect(card.checklist || []).toHaveLength(0);
      });
    });

    // 5. Verify Advanced Filters - Status (Column)
    const targetColId = capturedHook!.columns[0].id;
    cols = capturedHook!.getProcessedColumns('', { status: targetColId }, '');
    expect(cols).toHaveLength(1);
    expect(cols[0].id).toBe(targetColId);

    // 6. Verify Archiving Integration
    // Pick the first card from the first column
    const firstCol = capturedHook!.columns[0];
    const firstCard = firstCol.cards[0];
    expect(firstCard.archived).toBeFalsy();

    // Call deleteCard which executes archiving optimistically
    act(() => {
      capturedHook!.deleteCard(firstCol.id, firstCard.id);
    });

    // Check with default archived filter ('active') -> card is now hidden
    const activeCols = capturedHook!.getProcessedColumns('', { archivedFilter: 'active' }, '');
    const activeColCards = activeCols.find(c => c.id === firstCol.id)?.cards || [];
    expect(activeColCards.find(c => c.id === firstCard.id)).toBeUndefined();

    // Check with archived filter ('archived') -> card is visible
    const archivedCols = capturedHook!.getProcessedColumns('', { archivedFilter: 'archived' }, '');
    const archivedColCards = archivedCols.find(c => c.id === firstCol.id)?.cards || [];
    expect(archivedColCards.find(c => c.id === firstCard.id)).toBeDefined();
  });

  test('Sorting combinations in getProcessedColumns hook', () => {
    render(<TestBoardHarness />);
    expect(screen.getByTestId('harness')).toBeInTheDocument();

    expect(capturedHook).not.toBeNull();

    // Sort alphabetically
    let cols = capturedHook!.getProcessedColumns('', {}, 'alphabetical');
    cols.forEach(col => {
      const titles = col.cards.map(c => c.title);
      const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b, 'cs-CZ'));
      expect(titles).toEqual(sortedTitles);
    });

    // Sort by priority weight
    cols = capturedHook!.getProcessedColumns('', {}, 'priority');
    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    cols.forEach(col => {
      const weights = col.cards.map(c => (c.priority ? priorityWeight[c.priority] : 0));
      const sortedWeights = [...weights].sort((a, b) => b - a);
      expect(weights).toEqual(sortedWeights);
    });
  });
});

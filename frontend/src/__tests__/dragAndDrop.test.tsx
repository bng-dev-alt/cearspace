import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import Column from '../components/board/Column';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { Column as ColumnType } from '../types/kanban';

/**
 * Regrese: přetažení jediné karty mezi sloupci nesmí spustit reorder sloupců.
 * Kořenová příčina byla bubbling dragstart z karty na draggable <section>,
 * kvůli kterému se do dataTransfer zapsalo i 'text/column-id' a drop se
 * vyhodnotil jako prohození celých sloupců.
 */

class MockDataTransfer {
  private store: Record<string, string> = {};
  effectAllowed = '';
  dropEffect = '';
  setData(type: string, value: string) {
    this.store[type] = String(value);
  }
  getData(type: string) {
    return this.store[type] ?? '';
  }
  get types() {
    return Object.keys(this.store);
  }
}

interface HarnessProps {
  moveCard: (cardId: string, source: string, dest: string) => void;
  onColumnDragStart: (e: React.DragEvent, columnId: string) => void;
  onColumnDrop: (e: React.DragEvent, columnId: string) => void;
}

function Harness({ moveCard, onColumnDragStart, onColumnDrop }: HarnessProps) {
  const {
    draggingCardId,
    draggedOverColumnId,
    handleDragStart,
    handleDragEnd,
    handleDragOverColumn,
    handleDrop,
  } = useDragAndDrop(moveCard);

  const noop = () => {};

  const colA: ColumnType = {
    id: 'colA',
    name: 'A',
    cards: [{ id: 'card-1', title: 'Card 1', details: '' }],
  };
  const colB: ColumnType = { id: 'colB', name: 'B', cards: [] };

  const common = {
    draggedOverColumnId,
    draggingCardId,
    editingColumnId: null,
    editNameText: '',
    onEditNameTextChange: noop,
    onStartEditColumn: noop,
    onSaveColumnName: noop,
    onKeyDownColumnName: noop,
    onOpenAddModal: noop,
    onOpenEditModal: noop,
    onDeleteCard: noop,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragOverColumn: handleDragOverColumn,
    onDrop: handleDrop,
    onDeleteColumn: noop,
    onMoveColumn: noop,
    onColumnDragStart,
    onColumnDragOver: noop,
    onColumnDrop,
  };

  return (
    <div>
      <Column column={colA} isFirst isLast={false} {...common} />
      <Column column={colB} isFirst={false} isLast {...common} />
    </div>
  );
}

describe('Drag & Drop -- card vs column routing', () => {
  test('dragging a single card to another column moves only that card (no column reorder)', () => {
    const moveCard = vi.fn();
    const onColumnDragStart = vi.fn();
    const onColumnDrop = vi.fn();

    render(
      <Harness moveCard={moveCard} onColumnDragStart={onColumnDragStart} onColumnDrop={onColumnDrop} />
    );

    const card = screen.getByTestId('card-card-1');
    const targetColumn = screen.getByTestId('column-colB');

    const dt = new MockDataTransfer();
    fireEvent.dragStart(card, { dataTransfer: dt });
    fireEvent.drop(targetColumn, { dataTransfer: dt });

    // Přesune se právě jedna karta správným směrem
    expect(moveCard).toHaveBeenCalledTimes(1);
    expect(moveCard).toHaveBeenCalledWith('card-1', 'colA', 'colB');

    // Reorder sloupců se nesmí spustit
    expect(onColumnDrop).not.toHaveBeenCalled();
    // Bubbling z karty na sloupec je zastaven -> jen 'text/plain'
    expect(onColumnDragStart).not.toHaveBeenCalled();
    expect(dt.types).toEqual(['text/plain']);
  });

  test('handleDragStart stops propagation and marks the drag as a card drag only', () => {
    const moveCard = vi.fn();
    const { result } = renderHook(() => useDragAndDrop(moveCard));

    const dt = new MockDataTransfer();
    const stopPropagation = vi.fn();
    const event = {
      stopPropagation,
      dataTransfer: dt,
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragStart(event, 'card-1', 'colA');
    });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(dt.types).toEqual(['text/plain']);
    expect(dt.getData('text/plain')).toBe('card-1');
  });

  test('moving into an empty column and back leaves other columns untouched', () => {
    const moveCard = vi.fn();
    render(
      <Harness moveCard={moveCard} onColumnDragStart={vi.fn()} onColumnDrop={vi.fn()} />
    );

    const card = screen.getByTestId('card-card-1');
    const emptyColumn = screen.getByTestId('column-colB');

    const dt = new MockDataTransfer();
    fireEvent.dragStart(card, { dataTransfer: dt });
    fireEvent.drop(emptyColumn, { dataTransfer: dt });

    expect(moveCard).toHaveBeenCalledExactlyOnceWith('card-1', 'colA', 'colB');
  });
});

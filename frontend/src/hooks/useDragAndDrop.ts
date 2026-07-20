import { useState, useRef, useCallback } from 'react';

export function useDragAndDrop(moveCard: (cardId: string, sourceColumnId: string, destinationColumnId: string) => void) {
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [draggedOverColumnId, setDraggedOverColumnId] = useState<string | null>(null);
  const draggedCardRef = useRef<{ cardId: string; sourceColumnId: string } | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, cardId: string, sourceColumnId: string) => {
    // Karta je vnořená v draggable sloupci (<section>). Bez zastavení bubblingu
    // by se spustil i dragstart sloupce a do dataTransfer by se zapsalo
    // 'text/column-id', čímž by se drop vyhodnotil jako reorder sloupců
    // (prohození celých sloupců) místo přesunu jediné karty.
    e.stopPropagation();
    draggedCardRef.current = { cardId, sourceColumnId };
    setDraggingCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingCardId(null);
    setDraggedOverColumnId(null);
    draggedCardRef.current = null;
  }, []);

  const handleDragOverColumn = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDraggedOverColumnId((prev) => (prev !== columnId ? columnId : prev));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, destinationColumnId: string) => {
    e.preventDefault();
    setDraggedOverColumnId(null);
    setDraggingCardId(null);

    if (!draggedCardRef.current) return;
    const { cardId, sourceColumnId } = draggedCardRef.current;
    draggedCardRef.current = null;

    moveCard(cardId, sourceColumnId, destinationColumnId);
  }, [moveCard]);

  return {
    draggingCardId,
    draggedOverColumnId,
    handleDragStart,
    handleDragEnd,
    handleDragOverColumn,
    handleDrop,
  };
}

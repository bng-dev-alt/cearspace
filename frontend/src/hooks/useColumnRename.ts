import { useState, useCallback } from 'react';

export function useColumnRename(renameColumn: (columnId: string, newName: string) => void) {
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');

  const handleStartEdit = useCallback((columnId: string, currentName: string) => {
    setEditingColumnId(columnId);
    setEditNameText(currentName);
  }, []);

  const handleSave = useCallback((columnId: string) => {
    if (!editNameText.trim()) {
      setEditingColumnId(null);
      return;
    }
    renameColumn(columnId, editNameText.trim());
    setEditingColumnId(null);
  }, [editNameText, renameColumn]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, columnId: string) => {
    if (e.key === 'Enter') {
      handleSave(columnId);
    } else if (e.key === 'Escape') {
      setEditingColumnId(null);
    }
  }, [handleSave]);

  return {
    editingColumnId,
    editNameText,
    setEditNameText,
    handleStartEdit,
    handleSave,
    handleKeyDown,
  };
}

import React, { useState } from 'react';
import { Plus, MoreHorizontal, ArrowLeft, ArrowRight, Trash2, Edit3 } from 'lucide-react';

interface ColumnHeaderProps {
  columnId: string;
  columnName: string;
  cardCount: number;
  editingColumnId: string | null;
  editNameText: string;
  onEditNameTextChange: (value: string) => void;
  onStartEdit: (columnId: string, currentName: string) => void;
  onSave: (columnId: string) => void;
  onKeyDown: (e: React.KeyboardEvent, columnId: string) => void;
  onAddCard: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onMoveColumn?: (columnId: string, direction: 'left' | 'right') => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function ColumnHeader({
  columnId, columnName, cardCount,
  editingColumnId, editNameText, onEditNameTextChange,
  onStartEdit, onSave, onKeyDown, onAddCard,
  onDeleteColumn, onMoveColumn, isFirst, isLast,
}: ColumnHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="column-header">
      <div className="column-title-container">
        {editingColumnId === columnId ? (
          <input
            type="text"
            className="column-title-input"
            value={editNameText}
            onChange={(e) => onEditNameTextChange(e.target.value)}
            onBlur={() => onSave(columnId)}
            onKeyDown={(e) => onKeyDown(e, columnId)}
            autoFocus
            data-testid={`column-input-${columnId}`}
          />
        ) : (
          <h3
            className="column-title"
            onClick={() => onStartEdit(columnId, columnName)}
            title="Kliknutím přejmenujete"
            data-testid={`column-title-${columnId}`}
          >
            {columnName}
          </h3>
        )}
        <span className="column-card-count" data-testid={`column-count-${columnId}`}>
          {cardCount}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            className="column-header-plus"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Možnosti sloupce"
            data-testid={`column-menu-btn-${columnId}`}
          >
            <MoreHorizontal size={14} />
          </button>

          {isMenuOpen && (
            <>
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 90,
                }}
                onClick={() => setIsMenuOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  padding: '0.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  minWidth: '150px',
                  zIndex: 100,
                  marginTop: '4px',
                }}
                data-testid={`column-menu-dropdown-${columnId}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onStartEdit(columnId, columnName);
                    setIsMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--dark-navy)',
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  data-testid={`column-menu-rename-${columnId}`}
                >
                  <Edit3 size={12} />
                  Přejmenovat
                </button>

                {!isFirst && onMoveColumn && (
                  <button
                    type="button"
                    onClick={() => {
                      onMoveColumn(columnId, 'left');
                      setIsMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--dark-navy)',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    data-testid={`column-menu-move-left-${columnId}`}
                  >
                    <ArrowLeft size={12} />
                    Posunout doleva
                  </button>
                )}

                {!isLast && onMoveColumn && (
                  <button
                    type="button"
                    onClick={() => {
                      onMoveColumn(columnId, 'right');
                      setIsMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--dark-navy)',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    data-testid={`column-menu-move-right-${columnId}`}
                  >
                    <ArrowRight size={12} />
                    Posunout doprava
                  </button>
                )}

                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.2rem 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteColumn) onDeleteColumn(columnId);
                    setIsMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--danger)',
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-soft)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  data-testid={`column-menu-delete-${columnId}`}
                >
                  <Trash2 size={12} />
                  Smazat sloupec
                </button>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          className="column-header-plus"
          onClick={() => onAddCard(columnId)}
          title="Přidat kartu do tohoto sloupce"
          data-testid={`add-card-header-${columnId}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

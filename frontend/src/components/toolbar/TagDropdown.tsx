import { useRef, useState, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Column } from '../../types/kanban';
import { isTagUsed } from '../../utils/kanban';

interface TagDropdownProps {
  tags: string[];
  selectedTag: string;
  columns: Column[];
  onSelectTag: (tag: string) => void;
  onAddTag: (tag: string) => void;
  onDeleteTag: (tag: string) => void;
}

export default function TagDropdown({ tags, selectedTag, columns, onSelectTag, onAddTag, onDeleteTag }: TagDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => setIsOpen(false), []);
  useClickOutside(dropdownRef, closeDropdown);

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAddTag(trimmed);
      setNewTagInput('');
    }
  };

  return (
    <div className="custom-tag-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="toolbar-select custom-tag-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="tag-filter"
      >
        <Filter size={14} className="filter-icon" />
        <span>Štítek: {selectedTag || 'Všechny'}</span>
      </button>

      {isOpen && (
        <div className="custom-tag-dropdown-menu">
          <button
            type="button"
            className={`tag-dropdown-item ${selectedTag === '' ? 'active' : ''}`}
            onClick={() => { onSelectTag(''); setIsOpen(false); }}
          >
            Všechny štítky
          </button>
          <div className="tag-dropdown-divider" />

          <div className="tag-items-list">
            {tags.map((t) => {
              const used = isTagUsed(columns, t);
              return (
                <div key={t} className="tag-dropdown-row">
                  <button
                    type="button"
                    className={`tag-dropdown-item-btn ${selectedTag === t ? 'active' : ''}`}
                    onClick={() => { onSelectTag(t); setIsOpen(false); }}
                  >
                    {t}
                  </button>
                  {!used && (
                    <button
                      type="button"
                      className="tag-delete-x"
                      onClick={(e) => { e.stopPropagation(); onDeleteTag(t); }}
                      title="Odstranit nepoužívaný štítek"
                      aria-label={`Odstranit štítek ${t}`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="tag-dropdown-divider" />
          <div className="tag-add-row" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              className="tag-add-input"
              placeholder="Nový štítek..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
            />
            <button type="button" className="tag-add-btn" onClick={handleAddTag}>+</button>
          </div>
        </div>
      )}
    </div>
  );
}

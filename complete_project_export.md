# Kompletní export Kanban Board projektu (clearspace. inspired)

Tento soubor obsahuje kompletní specifikaci, designový systém a plné zdrojové kódy pro přenos projektu do jiného prostředí (např. ChatGPT Custom GPT nebo ChatGPT Projects).

---

## 1. Technická specifikace a požadavky

*   **Framework:** Next.js (App Router, Client-side rendering `'use client'`).
*   **Jazyk:** TypeScript.
*   **Stylování:** CSS Variables + Vanilla CSS (`globals.css`). Bez TailwindCSS.
*   **Ikony:** `lucide-react`.
*   **Testování:** Vitest + React Testing Library (lokalizované testy).
*   **Jazyk rozhraní:** Kompletní čeština (data, štítky, filtry, dialogy).
*   **Designový směr:** **Světlý motiv (Light Theme)** inspirovaný nástrojem **clearspace.**:
    *   Teplé šedé tóny pozadí sloupců (`#f7f6f4`), warm off-white pozadí stránky (`#fcfbfa`), čistě bílé karty s tenkým ohraničením (`#e4e3e0`) a jemnými stíny.
    *   Horní tenký navigační panel s logem `clearspace.` (navy barva a žlutá tečka), aktivní podtržená záložka `Board`, profilový avatar vpravo.
    *   Hero sekce s výrazným patkovým nadpisem (*Playfair Display*) *"Make meaningful progress."* a dvěma sloučenými kartami s metrikami napravo.
    *   Uspořádání sloupců s tenkými oddělovacími linkami, čítači karet v kroužku a svisle oddělenými úseky.
    *   Tlačítko `+ Nový úkol` umístěné pod kartami v každém sloupci (navržené jako minimalistické čárkovaně ohraničené CTA).

---

## 2. Struktura adresáře projektu (`frontend/`)

```text
frontend/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── types/
│   │   └── kanban.ts
│   ├── data/
│   │   └── dummyData.ts
│   ├── components/
│   │   ├── AddCardModal.tsx
│   │   └── EditCardModal.tsx
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── __tests__/
│       └── kanban.test.tsx
```

---

## 3. Zdrojové kódy souborů

### `frontend/package.json`
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lucide-react": "^1.24.0",
    "next": "16.2.10",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@playwright/test": "^1.61.1",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^6.0.3",
    "eslint": "^9",
    "eslint-config-next": "16.2.10",
    "jsdom": "^29.1.1",
    "typescript": "^5",
    "vitest": "^4.1.10"
  }
}
```

### `frontend/vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
});
```

### `frontend/src/setupTests.ts`
```typescript
import '@testing-library/jest-dom';
```

---

### `frontend/src/types/kanban.ts`
```typescript
export interface Assignee {
  name: string;
  initials: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  details: string;
  tag?: string;
  priority?: 'Low' | 'Medium' | 'High';
  assignee?: Assignee;
  dueDate?: string;
}

export interface Column {
  id: string;
  name: string;
  cards: Card[];
}
```

---

### `frontend/src/data/dummyData.ts`
```typescript
import { Column, Assignee } from '../types/kanban';

export const ASSIGNEES: Assignee[] = [
  { name: 'Alex Rivera', initials: 'AR', color: '#209dd7' }, // Modrá
  { name: 'Sarah Chen', initials: 'SC', color: '#753991' }, // Fialová
  { name: 'Marcus Johnson', initials: 'MJ', color: '#10b981' }, // Zelená
  { name: 'Elena Rostova', initials: 'ER', color: '#ecad0a' }, // Žlutá
];

export const INITIAL_COLUMNS: Column[] = [
  {
    id: 'column-1',
    name: 'Nápady',
    cards: [
      {
        id: 'card-1',
        title: 'Návrh mockupů hlavní stránky',
        details: 'Vytvořit vizuální návrhy pro desktopové a mobilní rozložení podle nových pravidel naší značky.',
        tag: 'Návrh',
        priority: 'Medium',
        assignee: ASSIGNEES[0],
        dueDate: '2026-07-20',
      },
      {
        id: 'card-2',
        title: 'Výzkum poskytovatelů OAuth',
        details: 'Vyhodnotit Auth0, Clerk a vlastní řešení z hlediska bezpečnosti, ceny a snadnosti integrace.',
        tag: 'Výzkum',
        priority: 'Low',
        assignee: ASSIGNEES[3],
        dueDate: '2026-07-25',
      },
    ],
  },
  {
    id: 'column-2',
    name: 'Naplánováno',
    cards: [
      {
        id: 'card-3',
        title: 'Konfigurace CI/CD pipeline',
        details: 'Nastavit workflow v GitHub Actions pro sestavení a otestování projektu při každém pull requestu.',
        tag: 'Funkce',
        priority: 'High',
        assignee: ASSIGNEES[1],
        dueDate: '2026-07-18',
      },
      {
        id: 'card-4',
        title: 'Napsat unit testy pro autentizaci',
        details: 'Dosáhnout alespoň 80% pokrytí kódu u ověřování a registrace uživatelů.',
        tag: 'Blokováno',
        priority: 'High',
        assignee: ASSIGNEES[2],
        dueDate: '2026-07-16',
      },
    ],
  },
  {
    id: 'column-3',
    name: 'V průběhu',
    cards: [
      {
        id: 'card-5',
        title: 'Refaktorovat správu stavu',
        details: 'Optimalizovat React hooky a vyčistit logiku kontextu, aby se zabránilo zbytečným re-renderům.',
        tag: 'Funkce',
        priority: 'Medium',
        assignee: ASSIGNEES[1],
        dueDate: '2026-07-22',
      },
    ],
  },
  {
    id: 'column-4',
    name: 'K revizi',
    cards: [
      {
        id: 'card-6',
        title: 'Vizuální testování napříč prohlížeči',
        details: 'Ověřit, zda se komponenty UI správně vykreslují v prohlížečích Chrome, Firefox a Safari.',
        tag: 'Výzkum',
        priority: 'Low',
        assignee: ASSIGNEES[0],
        dueDate: '2026-07-30',
      },
    ],
  },
  {
    id: 'column-5',
    name: 'Hotovo',
    cards: [
      {
        id: 'card-7',
        title: 'Úvodní schůzka k projektu',
        details: 'Sjednotit se se zúčastněnými stranami na počátečním rozsahu MVP, harmonogramu a výstupech.',
        tag: 'Návrh',
        priority: 'Low',
        assignee: ASSIGNEES[3],
        dueDate: '2026-07-10',
      },
    ],
  },
];
```

---

### `frontend/src/components/AddCardModal.tsx`
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ASSIGNEES } from '../data/dummyData';
import { Assignee } from '../types/kanban';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    details: string,
    tag?: string,
    priority?: 'Low' | 'Medium' | 'High',
    assignee?: Assignee,
    dueDate?: string
  ) => void;
  columnName: string;
  availableTags: string[];
}

export default function AddCardModal({
  isOpen,
  onClose,
  onSubmit,
  columnName,
  availableTags,
}: AddCardModalProps) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [tag, setTag] = useState<string>('');
  const [priority, setPriority] = useState<string>('Medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [error, setError] = useState('');

  // Reset inputs when opened
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDetails('');
      setTag('');
      setPriority('Medium');
      setAssigneeId('');
      setDueDate('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Název karty je povinný');
      return;
    }
    
    const selectedTag = tag ? tag : undefined;
    const selectedPriority = priority ? (priority as any) : undefined;
    const selectedAssignee = assigneeId ? ASSIGNEES.find((a) => a.name === assigneeId) : undefined;
    const selectedDueDate = dueDate || undefined;

    onSubmit(
      title.trim(),
      details.trim(),
      selectedTag,
      selectedPriority,
      selectedAssignee,
      selectedDueDate
    );
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">Přidat kartu do: {columnName}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Zavřít okno"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="card-title" className="form-label">
                Název *
              </label>
              <input
                id="card-title"
                type="text"
                className="form-input"
                placeholder="Zadejte název karty"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {error}
                </p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="card-details" className="form-label">
                Podrobnosti
              </label>
              <textarea
                id="card-details"
                className="form-textarea"
                placeholder="Zadejte podrobnosti nebo popis"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label htmlFor="card-tag" className="form-label">
                  Štítek
                </label>
                <select
                  id="card-tag"
                  className="form-input"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                >
                  <option value="">Žádný</option>
                  {availableTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="card-priority" className="form-label">
                  Priorita
                </label>
                <select
                  id="card-priority"
                  className="form-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Nízká</option>
                  <option value="Medium">Střední</option>
                  <option value="High">Vysoká</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="card-assignee" className="form-label">
                  Řešitel
                </label>
                <select
                  id="card-assignee"
                  className="form-input"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                >
                  <option value="">Nepřiřazeno</option>
                  {ASSIGNEES.map((member) => (
                    <option key={member.name} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="card-duedate" className="form-label">
                  Termín splnění
                </label>
                <input
                  id="card-duedate"
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              Zrušit
            </button>
            <button type="submit" className="btn btn-submit">
              Přidat kartu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### `frontend/src/components/EditCardModal.tsx`
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ASSIGNEES } from '../data/dummyData';
import { Assignee, Card } from '../types/kanban';

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    details: string,
    tag?: string,
    priority?: 'Low' | 'Medium' | 'High',
    assignee?: Assignee,
    dueDate?: string
  ) => void;
  card: Card | null;
  availableTags: string[];
}

export default function EditCardModal({
  isOpen,
  onClose,
  onSubmit,
  card,
  availableTags,
}: EditCardModalProps) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [tag, setTag] = useState<string>('');
  const [priority, setPriority] = useState<string>('Medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [error, setError] = useState('');

  // Reset inputs when opened or card changes
  useEffect(() => {
    if (isOpen && card) {
      setTitle(card.title);
      setDetails(card.details || '');
      setTag(card.tag || '');
      setPriority(card.priority || 'Medium');
      setAssigneeId(card.assignee ? card.assignee.name : '');
      setDueDate(card.dueDate || '');
      setError('');
    }
  }, [isOpen, card]);

  if (!isOpen || !card) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Název karty je povinný');
      return;
    }
    
    const selectedTag = tag ? tag : undefined;
    const selectedPriority = priority ? (priority as any) : undefined;
    const selectedAssignee = assigneeId ? ASSIGNEES.find((a) => a.name === assigneeId) : undefined;
    const selectedDueDate = dueDate || undefined;

    onSubmit(
      title.trim(),
      details.trim(),
      selectedTag,
      selectedPriority,
      selectedAssignee,
      selectedDueDate
    );
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="edit-modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        data-testid="edit-card-modal"
      >
        <div className="modal-header">
          <h2 className="modal-title">Upravit kartu</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Zavřít okno"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="edit-card-title" className="form-label">
                Název *
              </label>
              <input
                id="edit-card-title"
                type="text"
                className="form-input"
                placeholder="Zadejte název karty"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                data-testid="edit-card-title-input"
              />
              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {error}
                </p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-card-details" className="form-label">
                Podrobnosti
              </label>
              <textarea
                id="edit-card-details"
                className="form-textarea"
                placeholder="Zadejte podrobnosti nebo popis"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                data-testid="edit-card-details-input"
              />
            </div>

            <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label htmlFor="edit-card-tag" className="form-label">
                  Štítek
                </label>
                <select
                  id="edit-card-tag"
                  className="form-input"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  data-testid="edit-card-tag-select"
                >
                  <option value="">Žádný</option>
                  {availableTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-card-priority" className="form-label">
                  Priorita
                </label>
                <select
                  id="edit-card-priority"
                  className="form-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  data-testid="edit-card-priority-select"
                >
                  <option value="Low">Nízká</option>
                  <option value="Medium">Střední</option>
                  <option value="High">Vysoká</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-card-assignee" className="form-label">
                  Řešitel
                </label>
                <select
                  id="edit-card-assignee"
                  className="form-input"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  data-testid="edit-card-assignee-select"
                >
                  <option value="">Nepřiřazeno</option>
                  {ASSIGNEES.map((member) => (
                    <option key={member.name} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-card-duedate" className="form-label">
                  Termín splnění
                </label>
                <input
                  id="edit-card-duedate"
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  data-testid="edit-card-duedate-input"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              Zrušit
            </button>
            <button type="submit" className="btn btn-submit" data-testid="edit-card-submit">
              Uložit změny
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### `frontend/src/app/layout.tsx`
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "A professional, sleek single-board Kanban project management tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

---

### `frontend/src/app/page.tsx`
```tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Search, Settings, Calendar, Filter, ArrowUpDown, Layers, Clock, CheckCircle2, AlertOctagon, MoreHorizontal, X } from 'lucide-react';
import { INITIAL_COLUMNS, ASSIGNEES } from '../data/dummyData';
import { Column, Card } from '../types/kanban';
import AddCardModal from '../components/AddCardModal';
import EditCardModal from '../components/EditCardModal';

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Vyhledávání, filtry a řazení
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Dynamický seznam štítků
  const [tags, setTags] = useState<string[]>(['Funkce', 'Chyba', 'Výzkum', 'Návrh', 'Marketing', 'Blokováno']);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Zavření dropdownu při kliknutí mimo
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Drag and drop stavy
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [draggedOverColumnId, setDraggedOverColumnId] = useState<string | null>(null);
  const draggedCardRef = useRef<{ cardId: string; sourceColumnId: string } | null>(null);

  // Editace názvu sloupců
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');

  // Přidání karty modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);

  // Editace karty modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [editingSourceColumnId, setEditingSourceColumnId] = useState<string | null>(null);

  // Přejmenování sloupců
  const handleStartEditColumn = (columnId: string, currentName: string) => {
    setEditingColumnId(columnId);
    setEditNameText(currentName);
  };

  const handleSaveColumnName = (columnId: string) => {
    if (!editNameText.trim()) {
      setEditingColumnId(null);
      return;
    }
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, name: editNameText.trim() } : col))
    );
    setEditingColumnId(null);
  };

  const handleKeyDownColumnName = (e: React.KeyboardEvent, columnId: string) => {
    if (e.key === 'Enter') {
      handleSaveColumnName(columnId);
    } else if (e.key === 'Escape') {
      setEditingColumnId(null);
    }
  };

  // Přidání karty
  const handleOpenAddModal = (columnId: string) => {
    setTargetColumnId(columnId);
    setIsModalOpen(true);
  };

  const handleOpenGeneralAddModal = () => {
    const toDoCol = columns[0]?.id || 'column-1';
    setTargetColumnId(toDoCol);
    setIsModalOpen(true);
  };

  const handleAddCardSubmit = (
    title: string,
    details: string,
    tag?: string,
    priority?: 'Low' | 'Medium' | 'High',
    assignee?: any,
    dueDate?: string
  ) => {
    if (!targetColumnId) return;

    const newCard: Card = {
      id: `card-${Date.now()}`,
      title,
      details,
      tag,
      priority,
      assignee,
      dueDate,
    };

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === targetColumnId) {
          return {
            ...col,
            cards: [...col.cards, newCard],
          };
        }
        return col;
      })
    );
    setTargetColumnId(null);
  };

  // Editace karty
  const handleOpenEditModal = (columnId: string, card: Card) => {
    setEditingSourceColumnId(columnId);
    setEditingCard(card);
    setIsEditModalOpen(true);
  };

  const handleEditCardSubmit = (
    title: string,
    details: string,
    tag?: string,
    priority?: 'Low' | 'Medium' | 'High',
    assignee?: any,
    dueDate?: string
  ) => {
    if (!editingSourceColumnId || !editingCard) return;

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === editingSourceColumnId) {
          return {
            ...col,
            cards: col.cards.map((c) =>
              c.id === editingCard.id
                ? { ...c, title, details, tag, priority, assignee, dueDate }
                : c
            ),
          };
        }
        return col;
      })
    );
    setEditingCard(null);
    setEditingSourceColumnId(null);
  };

  // Smazání karty
  const handleDeleteCard = (columnId: string, cardId: string) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: col.cards.filter((card) => card.id !== cardId),
          };
        }
        return col;
      })
    );
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, cardId: string, sourceColumnId: string) => {
    draggedCardRef.current = { cardId, sourceColumnId };
    setDraggingCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragEnd = () => {
    setDraggingCardId(null);
    setDraggedOverColumnId(null);
    draggedCardRef.current = null;
  };

  const handleDragOverColumn = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedOverColumnId !== columnId) {
      setDraggedOverColumnId(columnId);
    }
  };

  const handleDrop = (e: React.DragEvent, destinationColumnId: string) => {
    e.preventDefault();
    setDraggedOverColumnId(null);
    setDraggingCardId(null);

    if (!draggedCardRef.current) return;
    const { cardId, sourceColumnId } = draggedCardRef.current;
    draggedCardRef.current = null;

    if (sourceColumnId === destinationColumnId) return;

    setColumns((prev) => {
      const sourceCol = prev.find((col) => col.id === sourceColumnId);
      const cardToMove = sourceCol?.cards.find((card) => card.id === cardId);

      if (!cardToMove) return prev;

      return prev.map((col) => {
        if (col.id === sourceColumnId) {
          return {
            ...col,
            cards: col.cards.filter((card) => card.id !== cardId),
          };
        }
        if (col.id === destinationColumnId) {
          return {
            ...col,
            cards: [...col.cards, cardToMove],
          };
        }
        return col;
      });
    });
  };

  const getTargetColumnName = () => {
    const col = columns.find((c) => c.id === targetColumnId);
    return col ? col.name : '';
  };

  // Statistiky
  const totalTasks = columns.reduce((acc, col) => acc + col.cards.length, 0);
  
  const inProgressCol = columns.find((c) => c.name === 'V průběhu' || c.id === 'column-3');
  const inProgressCount = inProgressCol ? inProgressCol.cards.length : 0;

  const completedCol = columns.find((c) => c.name === 'Hotovo' || c.id === 'column-5');
  const completedCount = completedCol ? completedCol.cards.length : 0;

  const blockedCount = columns.reduce(
    (acc, col) => acc + col.cards.filter((card) => card.tag === 'Blokováno').length,
    0
  );

  const getProcessedColumns = () => {
    return columns.map((col) => {
      // 1. Filtr
      let processedCards = col.cards.filter((card) => {
        const matchesSearch =
          !searchQuery.trim() ||
          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.details.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTag = !selectedTag || card.tag === selectedTag;

        const matchesPriority = !selectedPriority || card.priority === selectedPriority;

        return matchesSearch && matchesTag && matchesPriority;
      });

      // 2. Řazení
      if (sortBy === 'dueDate') {
        processedCards = [...processedCards].sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      } else if (sortBy === 'priority') {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        processedCards = [...processedCards].sort((a, b) => {
          const wA = a.priority ? priorityWeight[a.priority] : 0;
          const wB = b.priority ? priorityWeight[b.priority] : 0;
          return wB - wA;
        });
      }

      return {
        ...col,
        cards: processedCards,
      };
    });
  };

  const processedColumns = getProcessedColumns();

  // Překlad priorit
  const translatePriority = (p?: 'Low' | 'Medium' | 'High') => {
    if (p === 'High') return 'Vysoká';
    if (p === 'Medium') return 'Střední';
    return 'Nízká';
  };

  const getPriorityColor = (p?: 'Low' | 'Medium' | 'High') => {
    if (p === 'High') return '#ef4444';
    if (p === 'Medium') return 'var(--accent-yellow)';
    return 'var(--blue-primary)';
  };

  return (
    <div className="app-container" data-hydrated={isHydrated ? "true" : "false"}>
      
      {/* Hlavní horní navigační lišta podle clearspace. */}
      <header className="app-navbar">
        <div className="navbar-left">
          <div className="navbar-logo">
            clearspace<span className="logo-dot">.</span>
          </div>
        </div>
        <nav className="navbar-center">
          <span className="nav-link active">Board</span>
          <span className="nav-link">Projects</span>
          <span className="nav-link">Team</span>
        </nav>
        <div className="navbar-right">
          <div className="navbar-avatar">AM</div>
        </div>
      </header>

      {/* Hero sekce s rozložením clearspace. */}
      <section className="app-hero">
        <div className="hero-content">
          
          {/* Levá strana Hero sekce s výrazným textem */}
          <div className="hero-left">
            <span className="hero-team-label">PRODUCT TEAM / Q3</span>
            <h1 className="hero-title">Make meaningful progress.</h1>
            <p className="hero-desc">A calm space for the work that moves your team forward.</p>
          </div>

          {/* Pravá strana Hero sekce s dvěma kartami */}
          <div className="hero-right">
            <div className="hero-double-cards">
              <div className="hero-info-card highlighted-border">
                <span className="info-card-label">THIS WEEK</span>
                <span className="info-card-huge">07</span>
                <span className="info-card-sub">things thoughtfully moving forward</span>
              </div>
              <div className="hero-info-card">
                <span className="info-card-label">FOCUS NOTE</span>
                <span className="info-card-title">Keep the work moving.</span>
                <span className="info-card-sub">A thoughtful handoff is progress too.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plovoucí Toolbar panel nad boardem */}
      <section className="app-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="toolbar-search-input"
              placeholder="Hledat karty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input"
            />
          </div>

          <div className="toolbar-divider" />

          {/* Upravený dynamic tag dropdown filtr */}
          <div className="toolbar-filter-wrapper">
            <div className="custom-tag-dropdown-wrapper" ref={tagDropdownRef}>
              <button
                type="button"
                className="toolbar-select custom-tag-dropdown-btn"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                data-testid="tag-filter"
              >
                <Filter size={14} className="filter-icon" />
                <span>Štítek: {selectedTag || 'Všechny'}</span>
              </button>

              {isTagDropdownOpen && (
                <div className="custom-tag-dropdown-menu">
                  <button
                    type="button"
                    className={`tag-dropdown-item ${selectedTag === '' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedTag('');
                      setIsTagDropdownOpen(false);
                    }}
                  >
                    Všechny štítky
                  </button>
                  <div className="tag-dropdown-divider" />
                  
                  <div className="tag-items-list">
                    {tags.map((t) => {
                      const isTagUsed = columns.some((col) =>
                        col.cards.some((card) => card.tag === t)
                      );

                      return (
                        <div key={t} className="tag-dropdown-row">
                          <button
                            type="button"
                            className={`tag-dropdown-item-btn ${selectedTag === t ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedTag(t);
                              setIsTagDropdownOpen(false);
                            }}
                          >
                            {t}
                          </button>
                          {!isTagUsed && (
                            <button
                              type="button"
                              className="tag-delete-x"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTags((prev) => prev.filter((item) => item !== t));
                                if (selectedTag === t) {
                                  setSelectedTag('');
                                }
                              }}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmed = newTagInput.trim();
                          if (trimmed && !tags.includes(trimmed)) {
                            setTags((prev) => [...prev, trimmed]);
                            setNewTagInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="tag-add-btn"
                      onClick={() => {
                        const trimmed = newTagInput.trim();
                        if (trimmed && !tags.includes(trimmed)) {
                          setTags((prev) => [...prev, trimmed]);
                          setNewTagInput('');
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            <select
              className="toolbar-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              data-testid="priority-filter"
            >
              <option value="">Všechny priority</option>
              <option value="Low">Nízká</option>
              <option value="Medium">Střední</option>
              <option value="High">Vysoká</option>
            </select>
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-sort-wrapper">
            <ArrowUpDown size={14} className="sort-icon" />
            <select
              className="toolbar-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              data-testid="sort-by"
            >
              <option value="">Výchozí řazení</option>
              <option value="dueDate">Termín splnění</option>
              <option value="priority">Priorita</option>
            </select>
          </div>
        </div>

        <div className="toolbar-right">
          <button
            type="button"
            className="toolbar-settings-btn"
            title="Nastavení"
            onClick={() => alert('Nastavení: UI konfigurace layoutu')}
          >
            <Settings size={18} />
          </button>

          <button
            type="button"
            className="toolbar-new-task-btn"
            onClick={handleOpenGeneralAddModal}
            data-testid="new-task-btn"
          >
            <Plus size={16} />
            Nový úkol
          </button>
        </div>
      </section>

      {/* Přehledové statistiky */}
      <section className="app-stats-row">
        <div className="stat-card" style={{ borderLeftColor: 'var(--blue-primary)' }}>
          <div className="stat-info">
            <span className="stat-label">Celkem úkolů</span>
            <span className="stat-value">{totalTasks}</span>
          </div>
          <Layers size={15} className="stat-icon" />
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--accent-yellow)' }}>
          <div className="stat-info">
            <span className="stat-label">V průběhu</span>
            <span className="stat-value">{inProgressCount}</span>
          </div>
          <Clock size={15} className="stat-icon" />
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--purple-secondary)' }}>
          <div className="stat-info">
            <span className="stat-label">Dokončeno</span>
            <span className="stat-value">{completedCount}</span>
          </div>
          <CheckCircle2 size={15} className="stat-icon" />
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-info">
            <span className="stat-label">Blokováno</span>
            <span className="stat-value" style={{ color: blockedCount > 0 ? '#ef4444' : 'inherit' }}>
              {blockedCount}
            </span>
          </div>
          <AlertOctagon size={15} className="stat-icon" />
        </div>
      </section>

      {/* Kanban Board zabalený v ohraničeném boxu */}
      <div className="board-panel-card">
        <div className="board-panel-header">
          <div className="panel-header-left">
            <span className="panel-subtitle">YOUR WORKSPACE</span>
            <h2 className="panel-title">Product roadmap</h2>
          </div>
          <div className="panel-header-right">
            <span className="live-status-dot" />
            <span className="live-status-text">Live board</span>
          </div>
        </div>

        <main className="board-container" data-testid="board-container">
          {processedColumns.map((column) => (
            <section
              key={column.id}
              className={`column ${draggedOverColumnId === column.id ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOverColumn(e, column.id)}
              onDragEnter={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, column.id)}
              data-testid={`column-${column.id}`}
            >
              <div className="column-header">
                <div className="column-title-container">
                  {editingColumnId === column.id ? (
                    <input
                      type="text"
                      className="column-title-input"
                      value={editNameText}
                      onChange={(e) => setEditNameText(e.target.value)}
                      onBlur={() => handleSaveColumnName(column.id)}
                      onKeyDown={(e) => handleKeyDownColumnName(e, column.id)}
                      autoFocus
                      data-testid={`column-input-${column.id}`}
                    />
                  ) : (
                    <h3
                      className="column-title"
                      onClick={() => handleStartEditColumn(column.id, column.name)}
                      title="Kliknutím přejmenujete"
                      data-testid={`column-title-${column.id}`}
                    >
                      {column.name}
                    </h3>
                  )}
                  <span className="column-card-count" data-testid={`column-count-${column.id}`}>
                    {column.cards.length}
                  </span>
                </div>
                
                {/* Tlačítko + v hlavičce sloupce - unikátní testid */}
                <button
                  type="button"
                  className="column-header-plus"
                  onClick={() => handleOpenAddModal(column.id)}
                  title="Přidat kartu do tohoto sloupce"
                  data-testid={`add-card-header-${column.id}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="cards-list" data-testid={`cards-list-${column.id}`}>
                {column.cards.map((card) => (
                  <div
                    key={card.id}
                    className={`card ${draggingCardId === card.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id, column.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleOpenEditModal(column.id, card)}
                    data-testid={`card-${card.id}`}
                  >
                    <button
                      type="button"
                      className="card-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(column.id, card.id);
                      }}
                      aria-label={`Smazat kartu: ${card.title}`}
                      data-testid={`delete-card-${card.id}`}
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Drag indikátor nahoře na kartě */}
                    <div className="card-drag-handle">
                      <MoreHorizontal size={14} />
                    </div>

                    <h4 className="card-title">{card.title}</h4>
                    {card.details && <p className="card-details">{card.details}</p>}

                    {/* Štítky a priority na kartě */}
                    {(card.tag || card.priority) && (
                      <div className="card-badges-row">
                        {card.tag && (
                          <span className="card-tag">
                            {card.tag}
                          </span>
                        )}
                        {card.priority && (
                          <span className="card-priority-badge">
                            <span 
                              className="priority-indicator-dot" 
                              style={{ backgroundColor: getPriorityColor(card.priority) }} 
                            />
                            {translatePriority(card.priority)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Spodní řada karty */}
                    <div className="card-footer-row">
                      <span className="card-footer-work-label">Product work</span>
                      
                      {card.dueDate && (
                        <span className="card-due-date" title="Termín splnění">
                          <Calendar size={10} className="calendar-icon" />
                          {card.dueDate}
                        </span>
                      )}

                      {card.assignee ? (
                        <div 
                          className="card-assignee-initials" 
                          style={{ backgroundColor: card.assignee.color }}
                          title={card.assignee.name}
                        >
                          {card.assignee.initials}
                        </div>
                      ) : (
                        <div className="card-assignee-unassigned" title="Nepřiřazeno">
                          --
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tlačítko + Nový úkol pod kartami s testid add-card-btn-${column.id} pro zpětnou kompatibilitu testů */}
              <button
                type="button"
                className="column-add-card-btn"
                onClick={() => handleOpenAddModal(column.id)}
                data-testid={`add-card-btn-${column.id}`}
              >
                <Plus size={14} />
                <span>Nový úkol</span>
              </button>
            </section>
          ))}
        </main>
      </div>

      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCardSubmit}
        columnName={getTargetColumnName()}
        availableTags={tags}
      />

      <EditCardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditCardSubmit}
        card={editingCard}
        availableTags={tags}
      />
    </div>
  );
}
```

---

### `frontend/src/app/globals.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap');

:root {
  /* clearspace. Color Palette */
  --accent-yellow: #ecad0a;
  --blue-primary: #209dd7;
  --purple-secondary: #753991;
  --dark-navy: #0c1f38; /* Principal dark text/logo color */
  --gray-text: #888888;
  
  /* Layout Colors */
  --bg-page: #fcfbfa; /* Warm off-white */
  --bg-column: #f7f6f4; /* Light warm column background */
  --bg-card: #ffffff;
  --border-color: #e4e3e0; /* Thin warm gray border */
  
  /* Easing curves */
  --spring-transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  --font-sans: var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  background-color: var(--bg-page);
  color: var(--dark-navy);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}

/* App Container Layout */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-page);
}

/* Top Navigation Bar according to clearspace. */
.app-navbar {
  height: 3.5rem;
  padding: 0 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background-color: #ffffff;
  z-index: 20;
}

.navbar-logo {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--dark-navy);
}

.logo-dot {
  color: var(--accent-yellow);
}

.navbar-center {
  display: flex;
  gap: 1.75rem;
  height: 100%;
  align-items: center;
}

.nav-link {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--gray-text);
  cursor: pointer;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  transition: var(--spring-transition);
}

.nav-link:hover {
  color: var(--dark-navy);
}

.nav-link.active {
  color: var(--dark-navy);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--accent-yellow);
}

.navbar-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: var(--purple-secondary);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 1. Spacious Premium Hero Section (clearspace. inspired) */
.app-hero {
  position: relative;
  background-color: var(--bg-page);
  padding: 3.5rem 3rem 2.5rem 3rem; /* Spacious vertical margins */
  z-index: 5;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-width: 600px;
}

.hero-team-label {
  color: var(--blue-primary);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-title {
  font-family: 'Playfair Display', Georgia, serif; /* Serif elegant headline */
  font-size: 3.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--dark-navy);
  line-height: 1.15;
  margin-top: 0.15rem;
}

.hero-desc {
  font-size: 0.95rem;
  color: var(--gray-text);
  font-weight: 500;
  line-height: 1.4;
  margin-top: 0.35rem;
}

/* Hero Right Side metrics layout */
.hero-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.hero-double-cards {
  display: flex;
  gap: 0px; /* Merged style double cards */
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
}

.hero-info-card {
  padding: 1.25rem 1.5rem;
  width: 175px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background-color: #ffffff;
}

.hero-info-card:first-child {
  border-right: 1px solid var(--border-color);
}

.hero-info-card.highlighted-border {
  border-left: 2px solid var(--accent-yellow); /* Yellow left accent border */
}

.info-card-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--gray-text);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.info-card-huge {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--dark-navy);
  line-height: 1;
}

.info-card-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--dark-navy);
  line-height: 1.25;
}

.info-card-sub {
  font-size: 0.65rem;
  color: var(--gray-text);
  line-height: 1.3;
}

/* 2. Floating Toolbar Panel */
.app-toolbar {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.55rem 1.25rem;
  margin: 0 3rem 1.5rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.015);
  position: relative;
  z-index: 15;
  max-width: 1600px;
  align-self: center;
  width: calc(100% - 6rem);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toolbar-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.65rem;
  color: var(--gray-text);
  pointer-events: none;
}

.toolbar-search-input {
  width: 170px;
  padding: 0.4rem 0.65rem 0.4rem 2.1rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  outline: none;
  font-family: inherit;
  color: var(--dark-navy);
  transition: var(--spring-transition);
  background-color: #ffffff;
}

.toolbar-search-input:focus {
  width: 220px;
  border-color: var(--blue-primary);
  box-shadow: 0 0 0 2px rgba(32, 157, 215, 0.1);
}

.toolbar-divider {
  width: 1px;
  height: 18px;
  background-color: var(--border-color);
}

.toolbar-filter-wrapper,
.toolbar-sort-wrapper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.filter-icon,
.sort-icon {
  color: var(--gray-text);
}

.toolbar-select {
  padding: 0.35rem 1.65rem 0.35rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: #ffffff;
  color: var(--dark-navy);
  outline: none;
  cursor: pointer;
  font-family: inherit;
  transition: var(--spring-transition);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.45rem center;
  background-size: 0.65rem;
}

.toolbar-select:hover {
  background-color: #faf9f6;
  border-color: var(--gray-text);
}

.toolbar-select:focus {
  border-color: var(--blue-primary);
  box-shadow: 0 0 0 2px rgba(32, 157, 215, 0.08);
}

/* Custom dynamic tag dropdown overlay styling */
.custom-tag-dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.custom-tag-dropdown-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  text-align: left;
}

.custom-tag-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.35rem;
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(12, 31, 56, 0.08);
  width: 220px;
  padding: 0.5rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.tag-dropdown-item {
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--dark-navy);
  padding: 0.4rem 0.65rem;
  text-align: left;
  border-radius: 4px;
  cursor: pointer;
  transition: var(--spring-transition);
}

.tag-dropdown-item:hover,
.tag-dropdown-item.active {
  background-color: #faf9f6;
  color: var(--blue-primary);
  font-weight: 600;
}

.tag-dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 0.4rem 0;
}

.tag-items-list {
  max-height: 160px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.tag-dropdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  padding-right: 0.35rem;
  transition: var(--spring-transition);
}

.tag-dropdown-row:hover {
  background-color: #faf9f6;
}

.tag-dropdown-item-btn {
  flex: 1;
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--dark-navy);
  padding: 0.35rem 0.65rem;
  text-align: left;
  cursor: pointer;
  transition: var(--spring-transition);
}

.tag-dropdown-item-btn.active {
  color: var(--blue-primary);
  font-weight: 600;
}

.tag-delete-x {
  background: none;
  border: none;
  color: #a3a19e;
  cursor: pointer;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--spring-transition);
}

.tag-delete-x:hover {
  color: #ef4444;
  background-color: #fee2e2;
}

.tag-add-row {
  display: flex;
  gap: 0.35rem;
  padding: 0.25rem 0.15rem;
}

.tag-add-input {
  flex: 1;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.75rem;
  outline: none;
  font-family: inherit;
}

.tag-add-input:focus {
  border-color: var(--blue-primary);
}

.tag-add-btn {
  background-color: var(--blue-primary);
  color: #ffffff;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--spring-transition);
}

.tag-add-btn:hover {
  background-color: #178abf;
}

.toolbar-settings-btn {
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-text);
  cursor: pointer;
  transition: var(--spring-transition);
}

.toolbar-settings-btn:hover {
  background-color: #faf9f6;
  color: var(--dark-navy);
  border-color: var(--gray-text);
}

.toolbar-settings-btn:active {
  transform: scale(0.94);
}

.toolbar-new-task-btn {
  background-color: var(--purple-secondary);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.38rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: var(--spring-transition);
  box-shadow: 0 2px 6px rgba(117, 57, 145, 0.15);
}

.toolbar-new-task-btn:hover {
  background-color: #612f79;
  box-shadow: 0 4px 10px rgba(117, 57, 145, 0.25);
  transform: translateY(-1px);
}

.toolbar-new-task-btn:active {
  transform: translateY(0) scale(0.95);
}

/* 3. Statistics Cards Panel */
.app-stats-row {
  display: flex;
  gap: 1rem;
  padding: 0 3rem 1.25rem 3rem;
  max-width: 1600px;
  width: 100%;
  align-self: center;
}

.stat-card {
  flex: 1;
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-left: 3.5px solid var(--blue-primary);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.01);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: var(--spring-transition);
}

.stat-card:hover {
  transform: translateY(-1px);
  border-color: var(--gray-text);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--gray-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--dark-navy);
  margin-top: 0.05rem;
}

.stat-icon {
  color: var(--gray-text);
}

/* 4. Kanban Board Panel Card (Bordered wrapper inspired by clearspace.) */
.board-panel-card {
  flex: 1;
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin: 0 3rem 3rem 3rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.015);
  max-width: 1600px;
  align-self: center;
  width: calc(100% - 6rem);
}

.board-panel-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.panel-subtitle {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--gray-text);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.panel-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--dark-navy);
  letter-spacing: -0.02em;
}

.panel-header-right {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.live-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--accent-yellow);
  box-shadow: 0 0 6px var(--accent-yellow);
  animation: pulseYellow 2s infinite;
}

@keyframes pulseYellow {
  0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(236, 173, 10, 0.5); }
  70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(236, 173, 10, 0); }
  100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(236, 173, 10, 0); }
}

.live-status-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-text);
}

/* Kanban Board Columns inside the panel card */
.board-container {
  flex: 1;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  align-items: stretch;
}

.column {
  flex: 1;
  min-width: 260px;
  background-color: var(--bg-column); /* Light warm gray */
  border-right: 1px solid var(--border-color); /* Column grid lines */
  display: flex;
  flex-direction: column;
  transition: var(--spring-transition);
}

.column:last-child {
  border-right: none;
}

.column.drag-over {
  background-color: #faf9f6;
}

.column-header {
  padding: 1.1rem 1.25rem 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.column-title-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.column-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--dark-navy);
  cursor: pointer;
  transition: var(--spring-transition);
}

.column-title:hover {
  opacity: 0.7;
}

.column-title-input {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--dark-navy);
  border: 1px solid var(--purple-secondary);
  border-radius: 4px;
  outline: none;
  padding: 0.1rem 0.3rem;
  background-color: #ffffff;
  width: 120px;
}

.column-card-count {
  background-color: rgba(0, 0, 0, 0.04);
  color: var(--gray-text);
  font-size: 0.65rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Plus button in column header */
.column-header-plus {
  background: none;
  border: none;
  color: var(--blue-primary);
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: var(--spring-transition);
}

.column-header-plus:hover {
  background-color: rgba(32, 157, 215, 0.15);
  transform: scale(1.1);
}

/* Cards List */
.cards-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0.85rem 1rem 0.85rem; /* Clean padding */
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* Space between cards */
}

/* Scrollbars */
.cards-list::-webkit-scrollbar {
  width: 4px;
}

.cards-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

/* 5. clearspace. Pure White Cards */
.card {
  background-color: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 1.1rem 1.15rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  cursor: grab;
  position: relative;
  transition: var(--spring-transition);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.card:active {
  cursor: grabbing;
}

.card.dragging {
  opacity: 0.15;
  transform: scale(0.97);
}

/* Hover effect */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  border-color: #d1cfcb;
}

/* Drag indicator handle on card */
.card-drag-handle {
  display: flex;
  justify-content: flex-start;
  color: #d1cfcb;
  height: 10px;
  margin-top: -0.4rem;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--dark-navy);
  line-height: 1.35;
  letter-spacing: -0.015em;
}

.card-details {
  font-size: 0.75rem;
  color: var(--gray-text);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Badges Row styled elegantly */
.card-badges-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.15rem;
}

.card-tag {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background-color: #f0f0ed;
  color: var(--gray-text);
  border: 1px solid var(--border-color);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.card-priority-badge {
  font-size: 0.6rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--gray-text);
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.priority-indicator-dot {
  width: 4.5px;
  height: 4.5px;
  border-radius: 50%;
  display: inline-block;
}

/* Card Footer Detail Row */
.card-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.35rem;
  padding-top: 0.55rem;
  border-top: 1px solid var(--border-color);
}

.card-footer-work-label {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--gray-text);
}

.card-due-date {
  font-size: 0.65rem;
  color: var(--gray-text);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #faf9f6;
  border: 1px solid var(--border-color);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}

.calendar-icon {
  color: var(--gray-text);
}

/* Assignee initials */
.card-assignee-initials {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 0.55rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ffffff;
}

.card-assignee-unassigned {
  font-size: 0.65rem;
  color: #cbd5e1;
}

/* Card Delete Button (Polished fade-in) */
.card-delete-btn {
  position: absolute;
  top: 1.1rem;
  right: 1.15rem;
  background: none;
  border: none;
  color: var(--gray-text);
  cursor: pointer;
  padding: 3px;
  border-radius: 4px;
  opacity: 0;
  transform: translateY(-2px) scale(0.9);
  transition: var(--spring-transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card:hover .card-delete-btn {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.card-delete-btn:hover {
  color: #ef4444;
  background-color: #fee2e2;
}

/* Clean dashed "+ Nový úkol" button under column card list */
.column-add-card-btn {
  margin: 0 0.95rem 0.95rem 0.95rem;
  padding: 0.5rem;
  background-color: transparent;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  color: var(--gray-text);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: var(--spring-transition);
}

.column-add-card-btn:hover {
  background-color: rgba(0, 0, 0, 0.02);
  color: var(--dark-navy);
  border-color: #a3a19e;
  border-style: solid;
}

.column-add-card-btn:active {
  transform: scale(0.97);
}

/* Modal Styling in clearspace. warm off-white */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(12, 31, 56, 0.15); /* Light blue tint overlay */
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.06);
  border: 1px solid var(--border-color);
  overflow: hidden;
  animation: scaleIn 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  background-color: #ffffff;
  color: var(--dark-navy);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--dark-navy);
}

.modal-close-btn {
  background: none;
  border: none;
  color: var(--gray-text);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: var(--spring-transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  color: var(--dark-navy);
  background-color: #faf9f6;
}

.modal-body {
  padding: 1.5rem;
  background-color: #ffffff;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--gray-text);
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--dark-navy);
  outline: none;
  transition: var(--spring-transition);
  background-color: #ffffff;
}

.form-input:focus {
  border-color: var(--blue-primary);
  box-shadow: 0 0 0 2px rgba(32, 157, 215, 0.08);
}

.form-textarea {
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--dark-navy);
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: var(--spring-transition);
  background-color: #ffffff;
}

.form-textarea:focus {
  border-color: var(--blue-primary);
  box-shadow: 0 0 0 2px rgba(32, 157, 215, 0.08);
}

.modal-footer {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid var(--border-color);
  background-color: #faf9f6;
}

.btn {
  padding: 0.5rem 1.15rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--spring-transition);
  font-family: inherit;
}

.btn-cancel {
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  color: var(--gray-text);
}

.btn-cancel:hover {
  background-color: #faf9f6;
  border-color: var(--gray-text);
  color: var(--dark-navy);
}

.btn-cancel:active {
  transform: scale(0.95);
}

.btn-submit {
  background-color: var(--purple-secondary);
  border: 1px solid var(--purple-secondary);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(117, 57, 145, 0.15);
}

.btn-submit:hover {
  background-color: #612f79;
  border-color: #612f79;
  box-shadow: 0 4px 8px rgba(117, 57, 145, 0.25);
  transform: translateY(-1px);
}

.btn-submit:active {
  transform: translateY(0) scale(0.95);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.98); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

### `frontend/src/__tests__/kanban.test.tsx`
```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import KanbanBoard from '../app/page';

describe('Kanban Board App Unit Tests', () => {
  test('renders the Kanban Board header and columns', () => {
    render(<KanbanBoard />);
    
    // Hlavička z clearspace.
    expect(screen.getByRole('heading', { name: 'Make meaningful progress.', level: 1 })).toBeInTheDocument();
    
    // Počátečních 5 sloupců v češtině
    expect(screen.getByTestId('column-title-column-1')).toHaveTextContent('Nápady');
    expect(screen.getByTestId('column-title-column-2')).toHaveTextContent('Naplánováno');
    expect(screen.getByTestId('column-title-column-3')).toHaveTextContent('V průběhu');
    expect(screen.getByTestId('column-title-column-4')).toHaveTextContent('K revizi');
    expect(screen.getByTestId('column-title-column-5')).toHaveTextContent('Hotovo');
  });

  test('allows renaming columns', () => {
    render(<KanbanBoard />);
    
    const todoTitle = screen.getByTestId('column-title-column-1');
    expect(todoTitle).toBeInTheDocument();
    
    // Kliknutí na název sloupce pro zapnutí editace
    fireEvent.click(todoTitle);
    
    const input = screen.getByTestId('column-input-column-1') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Nápady');
    
    // Změna názvu a odeslání stiskem Enter
    fireEvent.change(input, { target: { value: 'Záloha' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Ověření, že se název aktualizoval
    expect(screen.getByTestId('column-title-column-1')).toHaveTextContent('Záloha');
  });

  test('allows adding a card to a column', () => {
    render(<KanbanBoard />);
    
    // Počet karet před přidáním
    const countBadge = screen.getByTestId('column-count-column-1');
    expect(countBadge).toHaveTextContent('2');
    
    // Kliknutí na plus button v hlavičce sloupce
    const addBtn = screen.getByTestId('add-card-btn-column-1');
    fireEvent.click(addBtn);
    
    // Ověření otevření modálního okna v češtině
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Přidat kartu do: Nápady')).toBeInTheDocument();
    
    // Vyplnění formuláře
    const titleInput = screen.getByLabelText('Název *');
    const detailsInput = screen.getByLabelText('Podrobnosti');
    
    fireEvent.change(titleInput, { target: { value: 'New Test Card' } });
    fireEvent.change(detailsInput, { target: { value: 'This is a description of the card' } });
    
    // Odeslání formuláře
    const modal = screen.getByRole('dialog');
    const submitBtn = modal.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submitBtn);
    
    // Ověření přidání a zavření modálu
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('New Test Card')).toBeInTheDocument();
    expect(screen.getByText('This is a description of the card')).toBeInTheDocument();
    expect(countBadge).toHaveTextContent('3');
  });

  test('allows deleting a card', () => {
    render(<KanbanBoard />);
    
    // Ověření, že výchozí karta existuje
    expect(screen.getByText('Návrh mockupů hlavní stránky')).toBeInTheDocument();
    const countBadge = screen.getByTestId('column-count-column-1');
    expect(countBadge).toHaveTextContent('2');
    
    // Kliknutí na smazat kartu card-1
    const deleteBtn = screen.getByTestId('delete-card-card-1');
    fireEvent.click(deleteBtn);
    
    // Ověření, že karta byla smazána
    expect(screen.queryByText('Návrh mockupů hlavní stránky')).not.toBeInTheDocument();
    expect(countBadge).toHaveTextContent('1');
  });

  test('allows editing a card', () => {
    render(<KanbanBoard />);
    
    // Kliknutí na kartu card-1
    const cardEl = screen.getByTestId('card-card-1');
    fireEvent.click(cardEl);
    
    // Ověření otevření editačního modálního okna
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Upravit kartu')).toBeInTheDocument();
    
    // Ověření předvyplněného názvu
    const titleInput = screen.getByTestId('edit-card-title-input') as HTMLInputElement;
    expect(titleInput.value).toBe('Návrh mockupů hlavní stránky');
    
    // Změna názvu karty
    fireEvent.change(titleInput, { target: { value: 'Návrh mockupů hlavní stránky v2' } });
    
    // Uložení
    const submitBtn = screen.getByTestId('edit-card-submit');
    fireEvent.click(submitBtn);
    
    // Ověření uložení změny
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Návrh mockupů hlavní stránky v2')).toBeInTheDocument();
  });
});
```

'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Column, Card } from '../../types/kanban';
import { getPriorityColor } from '../../utils/kanban';

interface CalendarViewProps {
  columns: Column[];
  /** Libovolné datum zobrazeného měsíce. */
  month: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onCardClick: (columnId: string, card: Card) => void;
}

interface DatedCard {
  card: Card;
  columnId: string;
}

const WEEKDAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const MAX_CARDS_PER_DAY = 3;

/** Lokální YYYY-MM-DD (ne UTC), aby seděl termín karty na správný den. */
function localKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Kalendář úkolů podle termínu (dueDate). Read-only view, klik otevře drawer. */
export default function CalendarView({
  columns,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
  onCardClick,
}: CalendarViewProps) {
  // Mapa den -> karty s termínem na daný den
  const { cardsByDay, undatedCount } = useMemo(() => {
    const map = new Map<string, DatedCard[]>();
    let undated = 0;
    for (const col of columns) {
      for (const card of col.cards) {
        if (!card.dueDate) {
          undated += 1;
          continue;
        }
        const key = card.dueDate.slice(0, 10); // dueDate je 'YYYY-MM-DD'
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ card, columnId: col.id });
      }
    }
    return { cardsByDay: map, undatedCount: undated };
  }, [columns]);

  // Mřížka měsíce (týdny od pondělí), doplněná o dny sousedních měsíců
  const weeks = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const first = new Date(year, m, 1);
    const startOffset = (first.getDay() + 6) % 7; // Po=0 ... Ne=6
    const gridStart = new Date(year, m, 1 - startOffset);

    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const cells: Date[] = [];
    for (let i = 0; i < totalCells; i++) {
      cells.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
    }
    const rows: Date[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [month]);

  const todayKey = localKey(new Date());
  const monthLabel = month.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });

  return (
    <div className="calendar-panel">
      <div className="calendar-header">
        <div className="calendar-title-group">
          <h2 className="calendar-month-title">{monthLabel}</h2>
          <span className="calendar-subtitle">Termíny úkolů projektu</span>
        </div>
        <div className="calendar-nav">
          <button type="button" className="calendar-today-btn" onClick={onToday} data-testid="calendar-today">
            Dnes
          </button>
          <button type="button" className="calendar-nav-btn" onClick={onPrevMonth} aria-label="Předchozí měsíc" data-testid="calendar-prev">
            <ChevronLeft size={16} />
          </button>
          <button type="button" className="calendar-nav-btn" onClick={onNextMonth} aria-label="Další měsíc" data-testid="calendar-next">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>

      <div className="calendar-grid" data-testid="calendar-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="calendar-week">
            {week.map((day) => {
              const key = localKey(day);
              const inMonth = day.getMonth() === month.getMonth();
              const isToday = key === todayKey;
              const dayCards = cardsByDay.get(key) || [];
              const shown = dayCards.slice(0, MAX_CARDS_PER_DAY);
              const extra = dayCards.length - shown.length;

              return (
                <div
                  key={key}
                  className={`calendar-day ${inMonth ? '' : 'is-outside'} ${isToday ? 'is-today' : ''}`}
                >
                  <span className="calendar-day-number">{day.getDate()}</span>
                  <div className="calendar-day-cards">
                    {shown.map(({ card, columnId }) => (
                      <button
                        key={card.id}
                        type="button"
                        className="calendar-card-chip"
                        onClick={() => onCardClick(columnId, card)}
                        title={card.title}
                        data-testid={`calendar-chip-${card.id}`}
                      >
                        <span
                          className="calendar-chip-dot"
                          style={{ backgroundColor: getPriorityColor(card.priority) }}
                        />
                        <span className="calendar-chip-title">{card.title}</span>
                      </button>
                    ))}
                    {extra > 0 && (
                      <span className="calendar-more">+{extra} další</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {undatedCount > 0 && (
        <div className="calendar-footer">
          {undatedCount} {undatedCount === 1 ? 'úkol' : undatedCount < 5 ? 'úkoly' : 'úkolů'} bez termínu se v kalendáři nezobrazuje
        </div>
      )}
    </div>
  );
}

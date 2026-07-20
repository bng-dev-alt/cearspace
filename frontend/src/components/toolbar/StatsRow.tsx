import React from 'react';
import { Layers, Clock, CheckCircle2, AlertOctagon, ChevronRight, ArrowRight } from 'lucide-react';

interface StatsRowProps {
  totalTasks: number;
  inProgressCount: number;
  completedCount: number;
  blockedCount: number;
  onOpenIntelligence?: () => void;
}

function StatsRow({ totalTasks, inProgressCount, completedCount, blockedCount, onOpenIntelligence }: StatsRowProps) {
  // "Chytrá" dlaždice: když jsou blokátory, Blokováno nese mikro-akci a otevře Project Intelligence.
  const blockedActionable = blockedCount > 0 && !!onOpenIntelligence;

  const stats = [
    { label: 'Celkem úkolů', value: totalTasks, Icon: Layers, danger: false, actionable: false },
    { label: 'V průběhu', value: inProgressCount, Icon: Clock, danger: false, actionable: false },
    { label: 'Dokončeno', value: completedCount, Icon: CheckCircle2, danger: false, actionable: false },
    { label: 'Blokováno', value: blockedCount, Icon: AlertOctagon, danger: blockedCount > 0, actionable: blockedActionable },
  ];

  return (
    <section className="app-stats-row">
      {stats.map(({ label, value, Icon, danger, actionable }) => (
        <div
          className={`stat-card ${actionable ? 'stat-card-actionable' : ''}`}
          key={label}
          onClick={actionable ? onOpenIntelligence : undefined}
          onKeyDown={
            actionable
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenIntelligence?.();
                  }
                }
              : undefined
          }
          role={actionable ? 'button' : undefined}
          tabIndex={actionable ? 0 : undefined}
          data-testid={actionable ? 'stat-card-blocked-action' : undefined}
        >
          <div className="stat-icon-box">
            <Icon size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-label">{label}</span>
            <span className="stat-value" style={danger ? { color: 'var(--danger)' } : undefined}>
              {value}
            </span>
          </div>
          {actionable ? (
            <span className="stat-action">
              Vyřešit <ArrowRight size={13} />
            </span>
          ) : (
            <span className="stat-chevron" aria-hidden="true">
              <ChevronRight size={16} />
            </span>
          )}
        </div>
      ))}
    </section>
  );
}

export default React.memo(StatsRow);

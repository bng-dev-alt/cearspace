import React from 'react';
import { Layers, Clock, CheckCircle2, AlertOctagon, ArrowRight } from 'lucide-react';
import { MetricCard } from '../ui';

interface StatsRowProps {
  totalTasks: number;
  inProgressCount: number;
  completedCount: number;
  blockedCount: number;
  onOpenIntelligence?: () => void;
}

// Rozměry dlaždic řeší CSS (.app-stats-row > .cs-metric), aby se daly
// přepsat na breakpointech (desktop 4 v řadě, tablet/mobil 2x2).

function StatsRow({ totalTasks, inProgressCount, completedCount, blockedCount, onOpenIntelligence }: StatsRowProps) {
  // "Chytrá" dlaždice: když jsou blokátory, Blokováno nese mikro-akci a otevře Project Intelligence.
  const blockedActionable = blockedCount > 0 && !!onOpenIntelligence;

  return (
    <section className="app-stats-row">
      <MetricCard icon={<Layers size={18} />} label="Celkem úkolů" value={totalTasks} />
      <MetricCard icon={<Clock size={18} />} label="V průběhu" value={inProgressCount} />
      <MetricCard icon={<CheckCircle2 size={18} />} label="Dokončeno" value={completedCount} />
      <MetricCard
        icon={<AlertOctagon size={18} />}
        label="Blokováno"
        value={blockedCount}
        danger={blockedCount > 0}
        onClick={blockedActionable ? onOpenIntelligence : undefined}
        testId={blockedActionable ? 'stat-card-blocked-action' : undefined}
        action={
          blockedActionable ? (
            <span className="cs-metric-action">
              Vyřešit <ArrowRight size={13} />
            </span>
          ) : undefined
        }
      />
    </section>
  );
}

export default React.memo(StatsRow);

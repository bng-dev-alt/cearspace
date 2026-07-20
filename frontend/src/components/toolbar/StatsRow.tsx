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

// flex-basis + minWidth necháme dlaždice růst do řady na desktopu a zalomit
// (2x2) na úzkých obrazovkách místo přeplácnutí textu.
const FILL: React.CSSProperties = { flex: '1 1 150px', minWidth: '150px' };

function StatsRow({ totalTasks, inProgressCount, completedCount, blockedCount, onOpenIntelligence }: StatsRowProps) {
  // "Chytrá" dlaždice: když jsou blokátory, Blokováno nese mikro-akci a otevře Project Intelligence.
  const blockedActionable = blockedCount > 0 && !!onOpenIntelligence;

  return (
    <section className="app-stats-row">
      <MetricCard style={FILL} icon={<Layers size={18} />} label="Celkem úkolů" value={totalTasks} />
      <MetricCard style={FILL} icon={<Clock size={18} />} label="V průběhu" value={inProgressCount} />
      <MetricCard style={FILL} icon={<CheckCircle2 size={18} />} label="Dokončeno" value={completedCount} />
      <MetricCard
        style={FILL}
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

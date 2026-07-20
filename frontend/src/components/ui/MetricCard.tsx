import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  danger?: boolean;
  trend?: React.ReactNode;
  onClick?: () => void;
  /** Volitelná mikro-akce vpravo (nahradí trailing chevron). */
  action?: React.ReactNode;
  /** Skryje trailing chevron (pro analytics karty, které nejsou klikatelné). */
  hideTrail?: boolean;
  testId?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** Sdílená metriková karta (Stats, AI Studio, AI History). Třídy .cs-metric. */
export default function MetricCard({
  icon,
  label,
  value,
  danger = false,
  trend,
  onClick,
  action,
  hideTrail = false,
  testId,
  className = '',
  style,
}: MetricCardProps) {
  const interactive = !!onClick;
  const cls = ['cs-metric', interactive && 'cs-metric--interactive', className].filter(Boolean).join(' ');

  const trail = action
    ? action
    : hideTrail
      ? null
      : <span className="cs-metric-trail" aria-hidden="true"><ChevronRight size={16} /></span>;

  const inner = (
    <>
      <span className="cs-metric-icon" aria-hidden="true">{icon}</span>
      <span className="cs-metric-body">
        <span className="cs-metric-label">{label}</span>
        <span className={`cs-metric-value ${danger ? 'cs-metric-value--danger' : ''}`}>{value}</span>
        {trend && <span className="cs-metric-trend">{trend}</span>}
      </span>
      {trail}
    </>
  );

  if (interactive) {
    return (
      <button type="button" className={cls} onClick={onClick} data-testid={testId} style={style}>
        {inner}
      </button>
    );
  }
  return (
    <div className={cls} data-testid={testId} style={style}>
      {inner}
    </div>
  );
}

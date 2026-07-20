import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Sdílený empty state (Design Bible: každý prázdný stav intencionálně navržen). Třídy .cs-empty. */
export default function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`cs-empty ${className}`.trim()}>
      <div className="cs-empty-visual" aria-hidden="true">{icon}</div>
      <div className="cs-empty-title">{title}</div>
      {description && <p className="cs-empty-desc">{description}</p>}
      {action}
    </div>
  );
}

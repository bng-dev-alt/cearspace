import React from 'react';

type Variant = 'default' | 'accent' | 'danger' | 'success' | 'warning';

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

/** Sdílený badge / chip (štítky, stavy). Třídy .cs-badge. */
export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const cls = ['cs-badge', variant !== 'default' && `cs-badge--${variant}`, className]
    .filter(Boolean)
    .join(' ');
  return <span className={cls}>{children}</span>;
}

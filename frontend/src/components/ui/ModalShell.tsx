'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number;
  testId?: string;
}

/** Sdílený obal dialogu (overlay + glass karta + header + zavření Esc/overlay). Třídy .cs-modal. */
export default function ModalShell({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth,
  testId,
}: ModalShellProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="cs-modal-overlay"
      onClick={onClose}
      data-testid={testId ? `${testId}-overlay` : undefined}
    >
      <div
        className="cs-modal"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        data-testid={testId}
      >
        {title !== undefined && (
          <div className="cs-modal-header">
            <div className="cs-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {icon}
              {title}
            </div>
            <button type="button" className="cs-modal-close" onClick={onClose} aria-label="Zavřít">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="cs-modal-body">{children}</div>
      </div>
    </div>
  );
}

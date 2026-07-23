'use client';

import React, { useState } from 'react';
import { X, KeyRound, ShieldAlert, Check } from 'lucide-react';
import { TeamMember } from '../../types/kanban';
import { collaborationService } from '../../services/collaborationService';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember;
  actorName?: string;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  member,
  actorName = 'Owner',
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 6) {
      setErrorMessage('Heslo musí mít minimálně 6 znaků.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Execute password reset via collaborationService
      await collaborationService.resetUserPassword(member.id, member.email || '', newPassword.trim(), actorName);
      setSuccessMessage(`Heslo pro uživatele "${member.fullName}" bylo úspěšně změněno.`);
      setNewPassword('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Nepodařilo se změnit heslo uživatele.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 33, 71, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
      data-testid="reset-password-modal"
    >
      <div
        style={{
          backgroundColor: 'var(--bg-page)',
          borderRadius: '14px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--surface-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <KeyRound size={20} style={{ color: 'var(--purple-secondary)' }} />
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dark-navy)', margin: 0 }}>
                Změna hesla účtu (Super Admin)
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-text)', margin: 0 }}>
                Uživatel: {member.fullName} ({member.email || 'Bez emailu'})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-text)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleResetSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {successMessage ? (
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(16, 124, 65, 0.12)',
                border: '1px solid rgba(16, 124, 65, 0.3)',
                borderRadius: '8px',
                color: '#107c41',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Check size={18} /> {successMessage}
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(236, 173, 10, 0.08)',
                  border: '1px solid rgba(236, 173, 10, 0.25)',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: 'var(--dark-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <ShieldAlert size={18} style={{ color: '#ecad0a', flexShrink: 0 }} />
                <span>Jako <strong>Owner</strong> měníte přihlašovací heslo účtu uživatele.</span>
              </div>

              {errorMessage && (
                <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', borderRadius: '6px', fontSize: '0.8rem' }}>
                  {errorMessage}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dark-navy)' }}>
                  Nové heslo pro uživatele *
                </label>
                <input
                  type="password"
                  placeholder="Zadejte nové heslo (min. 6 znaků)..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                  data-testid="reset-password-input"
                />
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--gray-text)',
              }}
            >
              {successMessage ? 'Zavřít' : 'Zrušit'}
            </button>

            {!successMessage && (
              <button
                type="submit"
                disabled={isSubmitting || !newPassword.trim()}
                style={{
                  padding: '0.5rem 1.2rem',
                  backgroundColor: 'var(--purple-secondary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isSubmitting || !newPassword.trim() ? 'not-allowed' : 'pointer',
                }}
                data-testid="submit-reset-password-btn"
              >
                {isSubmitting ? 'Ukládám...' : 'Uložit nové heslo'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

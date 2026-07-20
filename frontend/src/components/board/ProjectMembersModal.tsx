'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Search, Settings2, Users } from 'lucide-react';
import { TeamMember } from '../../types/kanban';

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceMembers: TeamMember[];
  projectMemberIds: string[];
  onChangeMembers: (memberIds: string[]) => void;
  onManageWorkspace: () => void;
}

/**
 * Správa členů projektu (Release 22).
 * Projekt nevytváří nové uživatele -- pouze vybírá podmnožinu členů Workspace.
 * Otevírá se z řádku avatarů pod Hero sekcí ("Členové projektu").
 */
export default function ProjectMembersModal({
  isOpen,
  onClose,
  workspaceMembers,
  projectMemberIds,
  onChangeMembers,
  onManageWorkspace,
}: ProjectMembersModalProps) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workspaceMembers;
    return workspaceMembers.filter(
      (m) => m.fullName.toLowerCase().includes(q) || (m.email && m.email.toLowerCase().includes(q))
    );
  }, [workspaceMembers, search]);

  if (!isOpen) return null;

  const toggle = (memberId: string) => {
    const isIn = projectMemberIds.includes(memberId);
    const next = isIn
      ? projectMemberIds.filter((id) => id !== memberId)
      : [...projectMemberIds, memberId];
    onChangeMembers(next); // okamžitá perzistence (optimisticky)
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="project-members-overlay">
      <div
        className="modal-content"
        style={{ maxWidth: '500px', width: '100%', minHeight: '380px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        data-testid="project-members-modal"
      >
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} />
            Členové projektu
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Zavřít okno"
            data-testid="project-members-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--gray-text)', lineHeight: 1.5, margin: 0 }}>
            Vyberte, kdo z členů Workspace patří do tohoto projektu. Přiřazovat úkoly lze
            pouze členům projektu.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-text)', fontWeight: 600 }}>
              V projektu: {projectMemberIds.length} / {workspaceMembers.length}
            </span>
            <button
              type="button"
              onClick={onManageWorkspace}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.35rem 0.7rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--blue-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              data-testid="manage-workspace-link"
            >
              <Settings2 size={13} />
              Spravovat Workspace
            </button>
          </div>

          {/* Vyhledávání */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              backgroundColor: 'var(--bg-column)',
            }}
          >
            <Search size={14} style={{ color: 'var(--gray-text)' }} />
            <input
              type="text"
              placeholder="Vyhledat člena..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '0.8rem', width: '100%', background: 'transparent', color: 'var(--dark-navy)' }}
              data-testid="project-members-search"
            />
          </div>

          {/* Seznam členů workspace s přepínačem členství */}
          <div
            style={{
              maxHeight: '240px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              paddingRight: '0.25rem',
            }}
            data-testid="project-members-list"
          >
            {workspaceMembers.length === 0 ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--gray-text)', fontSize: '0.85rem' }}>
                Workspace zatím nemá žádné členy.<br />
                Přidejte je přes &quot;Spravovat Workspace&quot;.
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--gray-text)', fontSize: '0.85rem' }}>
                Žádní členové nebyli nalezeni.
              </div>
            ) : (
              filtered.map((member) => {
                const isIn = projectMemberIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggle(member.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: isIn ? '1px solid var(--blue-primary)' : '1px solid var(--border-color)',
                      backgroundColor: isIn ? 'rgba(32, 157, 215, 0.06)' : 'var(--bg-column)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    data-testid={`project-member-toggle-${member.id}`}
                    aria-pressed={isIn}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: member.avatarColor,
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: isIn ? 1 : 0.55,
                          transition: 'opacity 0.15s ease',
                        }}
                      >
                        {member.initials}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--dark-navy)' }}>
                          {member.fullName}
                        </span>
                        {member.email && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--gray-text)' }}>{member.email}</span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        border: isIn ? 'none' : '1.5px solid var(--border-color)',
                        backgroundColor: isIn ? 'var(--blue-primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isIn && <Check size={14} style={{ color: '#ffffff' }} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-submit"
            onClick={onClose}
            data-testid="project-members-done-btn"
          >
            Hotovo
          </button>
        </div>
      </div>
    </div>
  );
}

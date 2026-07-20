'use client';

import React from 'react';
import { Pencil, Trash2, Folder, UserCheck, UserPlus } from 'lucide-react';
import { TeamMember } from '../../types/kanban';

interface MembersTableProps {
  members: TeamMember[];
  projectCounts: Record<string, number>;
  ownerProfileId?: string;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

function roleLabel(member: TeamMember, isOwner: boolean): string {
  if (isOwner) return 'Owner';
  if (member.workspaceRole === 'admin') return 'Admin';
  return 'Member';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MembersTable({ members, projectCounts, ownerProfileId, onEdit, onDelete }: MembersTableProps) {
  return (
    <div className="members-table" data-testid="members-table">
      <div className="members-table-head">
        <span>Člen</span>
        <span>Role</span>
        <span>Účet</span>
        <span>Projekty</span>
        <span>Přidán</span>
        <span />
      </div>

      {members.map((member) => {
        const isOwner = !!member.profileId && member.profileId === ownerProfileId;
        const linked = !!member.profileId;
        const count = projectCounts[member.id] || 0;

        return (
          <div className="member-row" key={member.id} data-testid={`member-row-${member.id}`}>
            {/* Člen */}
            <div className="member-cell member-main">
              <div className="member-avatar" style={{ backgroundColor: member.avatarColor }}>
                {member.initials}
              </div>
              <div className="member-name-block">
                <span className="member-name">{member.fullName}</span>
                {member.role && <span className="member-title">{member.role}</span>}
                {member.email && <span className="member-email">{member.email}</span>}
              </div>
            </div>

            {/* Role */}
            <div className="member-cell" data-label="Role">
              <span className={`role-badge ${isOwner ? 'is-owner' : member.workspaceRole === 'admin' ? 'is-admin' : 'is-member'}`}>
                {roleLabel(member, isOwner)}
              </span>
            </div>

            {/* Účet / kontakt */}
            <div className="member-cell" data-label="Účet">
              <span className={`account-chip ${linked ? 'is-linked' : 'is-contact'}`}>
                {linked ? <UserCheck size={12} /> : <UserPlus size={12} />}
                {linked ? 'Účet' : 'Kontakt'}
              </span>
            </div>

            {/* Projekty */}
            <div className="member-cell member-projects" data-label="Projekty">
              <Folder size={13} />
              {count}
            </div>

            {/* Přidán */}
            <div className="member-cell member-joined" data-label="Přidán">
              {formatDate(member.createdAt)}
            </div>

            {/* Akce */}
            <div className="member-cell member-actions">
              <button
                type="button"
                className="member-action-btn"
                onClick={() => onEdit(member)}
                title="Upravit člena"
                aria-label={`Upravit ${member.fullName}`}
                data-testid={`edit-member-${member.id}`}
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                className="member-action-btn danger"
                onClick={() => onDelete(member)}
                disabled={isOwner}
                title={isOwner ? 'Vlastníka nelze odebrat' : 'Odstranit člena'}
                aria-label={`Odstranit ${member.fullName}`}
                data-testid={`delete-member-${member.id}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

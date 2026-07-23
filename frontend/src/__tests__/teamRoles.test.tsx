import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserDetailModal from '../components/team/UserDetailModal';
import ResetPasswordModal from '../components/team/ResetPasswordModal';
import { collaborationService } from '../services/collaborationService';
import { TeamMember } from '../types/kanban';

describe('Team Management & Roles Unit Tests', () => {
  const mockMember: TeamMember = {
    id: 'm-100',
    fullName: 'Karel Svoboda',
    initials: 'KS',
    avatarColor: '#209dd7',
    email: 'karel@example.com',
    role: 'Developer',
    workspaceRole: 'member',
    createdAt: '2026-01-01T00:00:00Z',
  };

  it('renders UserDetailModal with member details and metadata', () => {
    render(<UserDetailModal isOpen={true} onClose={vi.fn()} member={mockMember} />);

    expect(screen.getByTestId('user-detail-modal')).toBeInTheDocument();
    expect(screen.getByText('Karel Svoboda')).toBeInTheDocument();
    expect(screen.getByText('karel@example.com')).toBeInTheDocument();
  });

  it('renders ResetPasswordModal and submits new password for Owner', async () => {
    const spyReset = vi.spyOn(collaborationService, 'resetUserPassword').mockResolvedValueOnce(true);

    render(<ResetPasswordModal isOpen={true} onClose={vi.fn()} member={mockMember} actorName="Owner" />);

    expect(screen.getByTestId('reset-password-modal')).toBeInTheDocument();

    const input = screen.getByTestId('reset-password-input');
    fireEvent.change(input, { target: { value: 'Secret123!' } });

    const submitBtn = screen.getByTestId('submit-reset-password-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(spyReset).toHaveBeenCalledWith('m-100', 'karel@example.com', 'Secret123!', 'Owner');
    });
  });
});

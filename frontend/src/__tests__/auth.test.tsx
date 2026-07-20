import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { kanbanService } from '../services/kanbanService';
import { usePathname, useRouter } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => {
  const replaceMock = vi.fn();
  const pushMock = vi.fn();
  return {
    usePathname: vi.fn().mockReturnValue('/'),
    useRouter: () => ({
      push: pushMock,
      replace: replaceMock,
    }),
  };
});

// A component to display auth status for testing context functions
function TestAuthComponent() {
  const { user, profile, login, register, logout, isLoading } = useAuth();
  return (
    <div>
      {isLoading && <div data-testid="loading">Loading...</div>}
      {user ? (
        <div>
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="profile-name">{profile?.display_name}</div>
          <button data-testid="logout-btn" onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <div data-testid="no-user">No User</div>
          <button 
            data-testid="login-btn" 
            onClick={() => login('test@example.com', 'password123')}
          >
            Login
          </button>
          <button 
            data-testid="register-btn" 
            onClick={() => register('new@example.com', 'password123', 'Novy Uzivatel')}
          >
            Register
          </button>
        </div>
      )}
    </div>
  );
}

describe('Identity Layer Unit & Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (usePathname as Mock).mockReturnValue('/');
  });

  test('AuthProvider initializes with no active session', async () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('no-user')).toBeInTheDocument();
  });

  test('Register function signs up a user, creates a profile, and auto-logs in', async () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Trigger registration
    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('new@example.com');
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Novy Uzivatel');
    });

    // Check localStorage contains user and session
    const mockUsers = JSON.parse(localStorage.getItem('kanban_mock_users') || '[]');
    expect(mockUsers.length).toBe(1);
    expect(mockUsers[0].email).toBe('new@example.com');
    expect(mockUsers[0].display_name).toBe('Novy Uzivatel');

    const session = JSON.parse(localStorage.getItem('kanban_mock_session') || '{}');
    expect(session.user.email).toBe('new@example.com');
  });

  test('Login succeeds with correct credentials and loads user profile', async () => {
    // Seed user in mock db
    const seededUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'password123',
      display_name: 'Tomas Novak',
    };
    localStorage.setItem('kanban_mock_users', JSON.stringify([seededUser]));
    localStorage.setItem(
      'kanban_mock_profiles', 
      JSON.stringify([{ id: 'user-123', email: 'test@example.com', display_name: 'Tomas Novak', created_at: new Date().toISOString() }])
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Tomas Novak');
    });
  });

  test('Logout clears session state and localStorage', async () => {
    // Seed logged-in session
    const activeUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { display_name: 'Tomas Novak' }
    };
    localStorage.setItem('kanban_mock_session', JSON.stringify({ user: activeUser, access_token: 'token-abc' }));

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    expect(localStorage.getItem('kanban_mock_session')).toBeNull();
  });

  test('Session is restored on page refresh', async () => {
    // Seed session in localStorage
    const activeUser = {
      id: 'user-999',
      email: 'session@restore.cz',
      user_metadata: { display_name: 'Borec' }
    };
    localStorage.setItem('kanban_mock_session', JSON.stringify({ user: activeUser, access_token: 'token-xyz' }));
    localStorage.setItem(
      'kanban_mock_profiles', 
      JSON.stringify([{ id: 'user-999', email: 'session@restore.cz', display_name: 'Borec', created_at: new Date().toISOString() }])
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('session@restore.cz');
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Borec');
    });
  });

  test('ProtectedRoute redirects unauthenticated users to /login', async () => {
    (usePathname as Mock).mockReturnValue('/'); // Protected path
    const { replace } = useRouter();

    render(
      <AuthProvider>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    // Should display loader initially
    expect(screen.getByText(/clearspace/)).toBeInTheDocument();

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/login');
    });
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('ProtectedRoute permits access to public path without session', async () => {
    (usePathname as Mock).mockReturnValue('/login'); // Public path

    render(
      <AuthProvider>
        <ProtectedRoute>
          <div data-testid="public-content">Login Page</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('public-content')).toBeInTheDocument();
    });
  });

  test('kanbanService filters and isolates projects by user_id', async () => {
    // Create projects for User A and User B
    const userA = 'user-a';
    const userB = 'user-b';

    await kanbanService.createProject('Projekt Uzivatele A', userA);
    await kanbanService.createProject('Projekt Uzivatele B', userB);

    // Fetch projects for User A
    const projectsA = await kanbanService.fetchProjects(userA);
    expect(projectsA.length).toBe(1);
    expect(projectsA[0].name).toBe('Projekt Uzivatele A');
    expect(projectsA[0].user_id).toBe(userA);

    // Fetch projects for User B
    const projectsB = await kanbanService.fetchProjects(userB);
    expect(projectsB.length).toBe(1);
    expect(projectsB[0].name).toBe('Projekt Uzivatele B');
    expect(projectsB[0].user_id).toBe(userB);
  });
});

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useTheme, ThemeChoice } from '../../contexts/ThemeContext';
import { deriveInitials } from '../../services/workspaceService';
import { LogOut, Sun, Moon, Monitor } from 'lucide-react';

const THEME_OPTIONS: { value: ThemeChoice; Icon: typeof Sun; label: string }[] = [
  { value: 'light', Icon: Sun, label: 'Světlý režim' },
  { value: 'system', Icon: Monitor, label: 'Podle systému' },
  { value: 'dark', Icon: Moon, label: 'Tmavý režim' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-toggle" role="group" aria-label="Přepínač motivu">
      {THEME_OPTIONS.map(({ value, Icon, label }) => (
        <button
          key={value}
          type="button"
          className={`theme-toggle-btn ${theme === value ? 'active' : ''}`}
          onClick={() => setTheme(value)}
          title={label}
          aria-label={label}
          aria-pressed={theme === value}
          data-testid={`theme-${value}`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [lastProjectId, setLastProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('last_opened_project_id');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastProjectId(id);
    }
  }, [pathname]);

  useClickOutside(dropdownRef as React.RefObject<HTMLElement | null>, () => {
    setIsDropdownOpen(false);
  });

  // Rozpoznání aktivní sekce podle aktuální adresy
  const isProjectsActive = pathname === '/' || pathname === '/projects';
  const isBoardActive = pathname.startsWith('/projects/');

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    router.push('/login');
  };

  const handleBoardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lastProjectId) {
      router.push(`/projects/${lastProjectId}`);
    } else {
      router.push('/');
    }
  };

  const handleTeamClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/team');
  };

  const displayName = profile?.display_name || profile?.email?.split('@')[0] || 'Uživatel';
  const displayEmail = profile?.email || '';

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <Link href="/" className="navbar-logo" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          clearspace<span className="logo-dot">.</span>
        </Link>
      </div>
      <nav className="navbar-center">
        <Link
          href={lastProjectId ? `/projects/${lastProjectId}` : '/'}
          onClick={handleBoardClick}
          className={`nav-link ${isBoardActive ? 'active' : ''}`}
          style={{ textDecoration: 'none', cursor: 'pointer' }}
          data-testid="navbar-board-link"
        >
          Board
        </Link>
        <Link 
          href="/" 
          className={`nav-link ${isProjectsActive ? 'active' : ''}`} 
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          Projekty
        </Link>
        <Link 
          href="/ai-control-center" 
          className={`nav-link ${pathname === '/ai-control-center' ? 'active' : ''}`} 
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          AI Studio
        </Link>
        <Link 
          href="/ai-history" 
          className={`nav-link ${pathname === '/ai-history' ? 'active' : ''}`} 
          style={{ textDecoration: 'none', cursor: 'pointer' }}
          data-testid="navbar-history-link"
        >
          AI History
        </Link>
        <span
          className={`nav-link ${pathname === '/team' ? 'active' : ''}`}
          onClick={handleTeamClick}
          style={{ cursor: 'pointer' }}
          data-testid="navbar-team-link"
        >
          Tým
        </span>
      </nav>
      
      <div className="navbar-right" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }} ref={dropdownRef}>
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="navbar-avatar"
          style={{ 
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--spring-transition)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
          data-testid="navbar-avatar-btn"
        >
          {deriveInitials(displayName)}
        </button>

        {isDropdownOpen && (
          <div 
            style={{
              position: 'absolute',
              right: 0,
              top: '2.5rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '1rem',
              minWidth: '220px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontFamily: 'var(--font-sans)',
            }}
            data-testid="navbar-dropdown"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dark-navy)' }}>
                {displayName}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--gray-text)', wordBreak: 'break-all' }}>
                {displayEmail}
              </span>
            </div>
            
            <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.25rem 0' }} />
            
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                padding: '0.4rem 0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--danger)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                width: '100%',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-soft)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              data-testid="logout-btn"
            >
              <LogOut size={14} />
              Odhlásit se
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Lock, Plus, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setError('Vyplňte prosím všechna povinná pole.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hesla se neshodují.');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await register(email, password, displayName);
      router.push('/');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Registrace se nezdařila. Zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: 'var(--surface-2)', // Warm off-white
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Left panel - Decorative Branding */}
      <div 
        style={{
          flex: '1.2',
          backgroundColor: '#0e2833', // Pevná ocean navy -- nezávislá na motivu (var(--text) se v dark mode obracel na světlou -> bílé logo/nadpis mizely)
          padding: '4rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="register-left-panel"
      >
        {/* Subtle background abstract shapes */}
        <div 
          style={{
            position: 'absolute',
            top: '-15%',
            right: '-15%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-soft) 0%, rgba(0,0,0,0) 70%)',
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-5%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-soft) 0%, rgba(0,0,0,0) 70%)',
          }}
        />

        <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff', zIndex: 10 }}>
          clearspace<span style={{ color: 'var(--accent-yellow)' }}>.</span>
        </div>

        <div style={{ maxWidth: '460px', zIndex: 10 }}>
          <span 
            style={{
              color: 'var(--blue-primary)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            SaaS Kanban Board
          </span>
          <h1 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '3rem',
              fontWeight: 700,
              lineHeight: '1.2',
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            Začněte ihned.
          </h1>
          <p 
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              fontWeight: 500,
              lineHeight: '1.5',
            }}
          >
            Vytvořte si bezplatný účet a začněte koordinovat práci svých týmů v přehledném Kanban prostředí během několika sekund.
          </p>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, zIndex: 10 }}>
          &copy; {new Date().getFullYear()} clearspace. Všechna práva vyhrazena.
        </div>
      </div>

      {/* Right panel - Registration Form */}
      <div 
        style={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          backgroundColor: 'var(--surface)',
          borderLeft: '1px solid var(--border-color)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <Link 
              href="/login" 
              style={{ 
                color: 'var(--gray-text)', 
                textDecoration: 'none', 
                fontSize: '0.8rem', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginBottom: '1rem',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dark-navy)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-text)'}
            >
              <ArrowLeft size={14} />
              Zpět na přihlášení
            </Link>
            <h2 
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--dark-navy)',
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem',
              }}
            >
              Registrace
            </h2>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem', fontWeight: 500 }}>
              Zaregistrujte si nový účet v systému clearspace.
            </p>
          </div>

          {error && (
            <div 
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--danger-soft)',
                color: 'var(--danger)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid var(--danger-soft)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label 
                htmlFor="displayName" 
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--dark-navy)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Jméno / Název firmy *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User 
                  size={16} 
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    color: 'var(--gray-text)',
                  }}
                />
                <input
                  id="displayName"
                  type="text"
                  placeholder="Jakub Novák"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    fontSize: 'var(--auth-input-font)',
                    fontWeight: 500,
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--dark-navy)',
                    transition: 'var(--spring-transition)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--blue-primary)';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.backgroundColor = 'var(--surface-2)';
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label 
                htmlFor="email" 
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--dark-navy)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                E-mail *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail 
                  size={16} 
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    color: 'var(--gray-text)',
                  }}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="jmeno@firma.cz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    fontSize: 'var(--auth-input-font)',
                    fontWeight: 500,
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--dark-navy)',
                    transition: 'var(--spring-transition)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--blue-primary)';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.backgroundColor = 'var(--surface-2)';
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label 
                htmlFor="password" 
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--dark-navy)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Heslo *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock 
                  size={16} 
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    color: 'var(--gray-text)',
                  }}
                />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    fontSize: 'var(--auth-input-font)',
                    fontWeight: 500,
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--dark-navy)',
                    transition: 'var(--spring-transition)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--blue-primary)';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.backgroundColor = 'var(--surface-2)';
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label 
                htmlFor="confirmPassword" 
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--dark-navy)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Potvrzení hesla *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock 
                  size={16} 
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    color: 'var(--gray-text)',
                  }}
                />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    fontSize: 'var(--auth-input-font)',
                    fontWeight: 500,
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--dark-navy)',
                    transition: 'var(--spring-transition)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--blue-primary)';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.backgroundColor = 'var(--surface-2)';
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'var(--purple-secondary)', // Purple action button
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'var(--spring-transition)',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 2px 4px var(--accent-soft)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            >
              <Plus size={16} />
              {isSubmitting ? 'Registrování...' : 'Zaregistrovat se'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 500, color: 'var(--gray-text)' }}>
            Již máte účet?&nbsp;
            <Link 
              href="/login" 
              style={{ 
                color: 'var(--blue-primary)', 
                textDecoration: 'none', 
                fontWeight: 700 
              }}
            >
              Přihlaste se
            </Link>
          </div>
        </div>
      </div>
      
      {/* Visual responsiveness styling */}
      <style jsx>{`
        @media (max-width: 900px) {
          .register-left-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

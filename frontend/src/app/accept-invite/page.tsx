'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, CheckCircle2, AlertCircle, Lock, User, ArrowRight } from 'lucide-react';
import { collaborationService } from '../../services/collaborationService';

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Token je k dispozici hned při prvním renderu, takže chybějící token
  // stačí odvodit v inicializaci -- žádný efekt navíc.
  const [error, setError] = useState<string | null>(
    token ? null : 'Neplatný nebo chybějící pozvánkový token v adrese.'
  );
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Zadejte prosím své celé jméno.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Heslo musí obsahovat alespoň 6 znaků.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await collaborationService.acceptInvitationToken(token, displayName.trim(), password.trim());
      setSuccess(true);
      setTimeout(() => {
        router.push(res.projectId ? `/projects/${res.projectId}` : '/');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se přihlásit z pozvánky.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-page)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface-1)',
          borderRadius: '16px',
          padding: '2.5rem',
          maxWidth: '460px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              backgroundColor: 'rgba(117, 57, 145, 0.12)',
              color: 'var(--purple-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Sparkles size={28} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0 0 0.4rem' }}>
            Přijetí pozvánky do týmu
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)', margin: 0 }}>
            ClearSpace Kanban – Nastavte si svůj profil a heslo
          </p>
        </div>

        {success ? (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(16, 124, 65, 0.12)',
              border: '1px solid rgba(16, 124, 65, 0.3)',
              borderRadius: '10px',
              color: '#107c41',
              textAlign: 'center',
            }}
            data-testid="accept-invite-success"
          >
            <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem' }} />
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 800 }}>Pozvánka úspěšně přijata!</h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Přesměrováváme vás přímo na projektovou nástěnku...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--danger-soft)',
                  color: 'var(--danger)',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dark-navy)' }}>
                Vaše celé jméno *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--gray-text)' }} />
                <input
                  type="text"
                  placeholder="Jan Novák..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                  data-testid="accept-invite-name-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dark-navy)' }}>
                Nové přístupové heslo *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--gray-text)' }} />
                <input
                  type="password"
                  placeholder="Zvolte si heslo (min. 6 znaků)..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                  data-testid="accept-invite-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'var(--purple-secondary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: isLoading || !token ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
              }}
              data-testid="accept-invite-submit-btn"
            >
              {isLoading ? 'Aktivuji účet...' : 'Aktivovat účet a vstoupit'} <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <Link href="/login" style={{ fontSize: '0.8rem', color: 'var(--purple-secondary)', fontWeight: 600, textDecoration: 'none' }}>
            Již máte účet? Přihlásit se
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Načítání...</div>}>
      <AcceptInviteForm />
    </Suspense>
  );
}

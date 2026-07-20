'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'clearspace-theme';

interface ThemeContextType {
  theme: ThemeChoice;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeChoice) => void;
}

// Bezpečná výchozí hodnota -> useTheme funguje i bez provideru (např. v testech,
// které renderují podstrom bez ThemeProvideru). V aplikaci je provider vždy v layoutu.
const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolve(choice: ThemeChoice): ResolvedTheme {
  if (choice === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return choice;
}

function apply(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  // Potlačit tranzice během přepnutí -> ostrý, "premium" přechod bez crossfade.
  el.classList.add('theme-switching');
  el.setAttribute('data-theme', resolved);
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => el.classList.remove('theme-switching'));
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Inicializace bez čtení localStorage (SSR-safe); skutečná hodnota se
  // dorovná v useEffect. Bliknutí řeší no-flash skript v <head>.
  const [theme, setThemeState] = useState<ThemeChoice>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Načíst uloženou preferenci při startu
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeChoice | null) || 'system';
    const res = resolve(stored);
    // Synchronizace React stavu s uloženou preferencí po mountu (vizuál řeší
    // no-flash skript v <head>, tady jen dorovnáváme stav pro přepínač).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(stored);
    setResolvedTheme(res);
    apply(res);
  }, []);

  // Reagovat na změnu systémového nastavení, pokud je zvoleno 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const res: ResolvedTheme = mql.matches ? 'dark' : 'light';
      setResolvedTheme(res);
      apply(res);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    const res = resolve(next);
    setResolvedTheme(res);
    apply(res);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/** Inline skript pro <head>, který nastaví data-theme před prvním vykreslením. */
export const themeNoFlashScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

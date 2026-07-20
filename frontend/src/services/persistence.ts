/**
 * Transparentní hlášení chyb persistence (Release 21).
 *
 * Dřívější chování: při selhání zápisu do Supabase se data tiše uložila
 * do localStorage, čímž vznikaly dvě rozdílné verze dat (split-brain).
 * Nové chování: v Supabase režimu se do localStorage nezapisuje nikdy;
 * selhání se nahlásí sem a UI je zobrazí uživateli.
 */

export type PersistenceListener = (error: string | null) => void;

const listeners = new Set<PersistenceListener>();
let lastError: string | null = null;

function notify(): void {
  listeners.forEach((listener) => listener(lastError));
}

export const persistenceStatus = {
  report(operation: string, error: unknown): void {
    console.error(`[persistence] ${operation}:`, error);
    lastError = `Nepodařilo se uložit změnu do databáze (${operation}). Zobrazená data nemusí být aktuální.`;
    notify();
  },

  clear(): void {
    if (lastError !== null) {
      lastError = null;
      notify();
    }
  },

  subscribe(listener: PersistenceListener): () => void {
    listeners.add(listener);
    listener(lastError);
    return () => {
      listeners.delete(listener);
    };
  },
};

'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, ChevronDown, Check, Zap, Brain, Shield } from 'lucide-react';

export type AiModelOption = 'gemini-3.5-flash' | 'gemini-3.5-pro' | 'gemini-3.0-flash' | 'auto';

export interface ModelDetails {
  id: AiModelOption;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

export const AI_MODELS: ModelDetails[] = [
  {
    id: 'auto',
    name: 'Auto (Chytrý výběr)',
    badge: 'DOPORUČENO',
    description: 'Automaticky volí nejvhodnější model dle typu spouštěné akce.',
    icon: Zap,
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'RYCHLÝ',
    description: 'Bleskový a úsporný model. Ideální pro běžné úkoly, chat a úpravy.',
    icon: Zap,
  },
  {
    id: 'gemini-3.5-pro',
    name: 'Gemini 3.5 Pro',
    badge: 'PRO',
    description: 'Vysoká rozvažovací schopnost. Vhodný pro analýzu rizik a architekturu.',
    icon: Brain,
  },
  {
    id: 'gemini-3.0-flash',
    name: 'Gemini 3.0 Flash',
    badge: 'ZÁLOHA',
    description: 'Stabilní záložní model při vyčerpání limitů novějších verzí.',
    icon: Shield,
  },
];

export function getSelectedAiModel(): AiModelOption {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('selected_ai_model') as AiModelOption;
    if (saved && ['gemini-3.5-flash', 'gemini-3.5-pro', 'gemini-3.0-flash', 'auto'].includes(saved)) {
      return saved;
    }
  }
  return 'auto';
}

interface AiModelSelectorProps {
  compact?: boolean;
}

export default function AiModelSelector({ compact = false }: AiModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState<AiModelOption>('auto');
  const [isOpen, setIsOpen] = useState(false);

  // Preference se čte až po mountu. Lazy initializer by na serveru vrátil
  // jinou hodnotu než v prohlížeči (localStorage tam není) -> hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedModel(getSelectedAiModel());
  }, []);

  const handleSelect = (modelId: AiModelOption) => {
    setSelectedModel(modelId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_ai_model', modelId);
      window.dispatchEvent(new CustomEvent('ai_model_changed', { detail: modelId }));
    }
    setIsOpen(false);
  };

  const activeModel = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[0];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} data-testid="ai-model-selector">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: compact ? '0.25rem 0.55rem' : '0.4rem 0.75rem',
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          fontSize: compact ? '0.72rem' : '0.8rem',
          fontWeight: 700,
          color: 'var(--dark-navy)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        data-testid="ai-model-selector-btn"
      >
        <Cpu size={compact ? 13 : 15} style={{ color: 'var(--purple-secondary)' }} />
        <span>{activeModel.name}</span>
        <ChevronDown size={13} style={{ color: 'var(--gray-text)' }} />
      </button>

      {isOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '280px',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 9999,
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
            data-testid="ai-model-dropdown"
          >
            <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--gray-text)', textTransform: 'uppercase' }}>
              Výběr AI Modelu
            </div>

            {AI_MODELS.map((model) => {
              const isSelected = model.id === selectedModel;
              const IconComp = model.icon;
              return (
                <div
                  key={model.id}
                  onClick={() => handleSelect(model.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    padding: '0.55rem 0.65rem',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'rgba(117, 57, 145, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  data-testid={`ai-model-option-${model.id}`}
                >
                  <IconComp size={16} style={{ marginTop: '0.15rem', color: isSelected ? 'var(--purple-secondary)' : 'var(--gray-text)' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dark-navy)' }}>
                        {model.name}
                      </span>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'var(--bg-column)', color: 'var(--purple-secondary)' }}>
                        {model.badge}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gray-text)', lineHeight: '1.3' }}>
                      {model.description}
                    </span>
                  </div>
                  {isSelected && <Check size={14} style={{ color: 'var(--purple-secondary)', marginTop: '0.2rem' }} />}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AiModelSelector, { getSelectedAiModel } from '../components/ai/AiModelSelector';

describe('AiModelSelector Unit Tests', () => {
  it('defaults to auto and handles model selection', () => {
    localStorage.clear();
    expect(getSelectedAiModel()).toBe('auto');

    render(<AiModelSelector />);

    const button = screen.getByTestId('ai-model-selector-btn');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Auto (Chytrý výběr)');

    // Open dropdown
    fireEvent.click(button);
    expect(screen.getByTestId('ai-model-dropdown')).toBeInTheDocument();

    // Select Gemini 3.5 Pro
    const proOption = screen.getByTestId('ai-model-option-gemini-3.5-pro');
    fireEvent.click(proOption);

    expect(localStorage.getItem('selected_ai_model')).toBe('gemini-3.5-pro');
    expect(getSelectedAiModel()).toBe('gemini-3.5-pro');
  });
});

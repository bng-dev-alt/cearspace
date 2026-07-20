import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { promptBuilder, formatCardContext } from '../services/ai/promptBuilder';
import { geminiProvider } from '../services/ai/geminiProvider';
import { aiService } from '../services/ai/aiService';
import { POST } from '../app/api/ai/chat/route';
import { POST as improvePOST } from '../app/api/ai/improve/route';
import { NextRequest } from 'next/server';
import { Card } from '../types/kanban';

// Define mock generateContent
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    models = {
      generateContent: mockGenerateContent,
    };
  }
  return {
    GoogleGenAI: MockGoogleGenAI,
  };
});

describe('AI Foundation Architecture Unit & Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('1. Prompt Builder Tests', () => {
    const mockCard: Card = {
      id: 'task-123',
      title: 'Tvorba dokumentace',
      details: 'Popiš novou architekturu',
      priority: 'High',
      checklist: [{ id: 'chk-1', text: 'Napsat text', completed: false }],
      comments: [{ id: 'c-1', authorName: 'Tester', content: 'Výborný nápad', createdAt: '2026-07-17T20:00:00Z' }],
      activities: [{ id: 'a-1', text: 'Vytvořeno', createdAt: '2026-07-17T19:00:00Z' }],
    };

    test('formatCardContext serializes all card fields', () => {
      const text = formatCardContext(mockCard);
      expect(text).toContain('Tvorba dokumentace');
      expect(text).toContain('Popiš novou architekturu');
      expect(text).toContain('High');
      expect(text).toContain('Napsat text');
      expect(text).toContain('Výborný nápad');
      expect(text).toContain('Vytvořeno');
    });

    test('buildChatPrompt injects formatted context and system role', () => {
      const messages = promptBuilder.buildChatPrompt([{ role: 'user', content: 'Ahoj' }], { card: mockCard });
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toContain('Jste inteligentní AI Asistent');
      expect(messages[0].content).toContain('Tvorba dokumentace');
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toBe('Ahoj');
    });

    test('buildTaskGeneratePrompt shapes prompt for JSON returns', () => {
      const messages = promptBuilder.buildTaskGeneratePrompt('OAuth registrace');
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toContain('JSON');
      expect(messages[1].role).toBe('user');
      expect(messages[1].content).toContain('OAuth registrace');
    });
  });

  describe('2. Gemini Provider Mocked Tests', () => {
    test('generateCompletion throws when API key is missing', async () => {
      delete process.env.GEMINI_API_KEY;
      await expect(
        geminiProvider.generateCompletion([{ role: 'user', content: 'test' }], { model: 'gemini-3.5-flash' })
      ).rejects.toThrow('GEMINI_API_KEY_MISSING');
    });

    test('generateCompletion handles invalid API key', async () => {
      process.env.GEMINI_API_KEY = 'invalid-key';
      mockGenerateContent.mockRejectedValueOnce(new Error('API key not valid'));

      await expect(
        geminiProvider.generateCompletion([{ role: 'user', content: 'test' }], { model: 'gemini-3.5-flash' })
      ).rejects.toThrow('GEMINI_INVALID_API_KEY');
    });

    test('generateCompletion handles rate limit', async () => {
      process.env.GEMINI_API_KEY = 'valid-key';
      mockGenerateContent.mockRejectedValueOnce(new Error('Quota exceeded'));

      await expect(
        geminiProvider.generateCompletion([{ role: 'user', content: 'test' }], { model: 'gemini-3.5-flash' })
      ).rejects.toThrow('GEMINI_RATE_LIMIT');
    });

    test('generateCompletion parses valid response correctly', async () => {
      process.env.GEMINI_API_KEY = 'valid-key';
      mockGenerateContent.mockResolvedValueOnce({
        text: 'AI Odpověď',
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 15, totalTokenCount: 25 },
      });

      const res = await geminiProvider.generateCompletion([{ role: 'user', content: 'test' }], { model: 'gemini-3.5-flash' });
      expect(res.content).toBe('AI Odpověď');
      expect(res.model).toBe('gemini-3.5-flash');
      expect(res.usage?.totalTokens).toBe(25);
    });

    test('generateCompletion retries once on a transient timeout and succeeds', async () => {
      process.env.GEMINI_API_KEY = 'valid-key';
      mockGenerateContent
        .mockRejectedValueOnce(new Error('DEADLINE_EXCEEDED'))
        .mockResolvedValueOnce({
          text: 'Po retry OK',
          usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 2, totalTokenCount: 3 },
        });

      const res = await geminiProvider.generateCompletion([{ role: 'user', content: 'test' }], { model: 'gemini-3.5-flash' });
      expect(res.content).toBe('Po retry OK');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    test('generateCompletion gives up (GEMINI_TIMEOUT) after one retry on repeated timeout', async () => {
      process.env.GEMINI_API_KEY = 'valid-key';
      mockGenerateContent
        .mockRejectedValueOnce(new Error('DEADLINE_EXCEEDED'))
        .mockRejectedValueOnce(new Error('DEADLINE_EXCEEDED'));

      await expect(
        geminiProvider.generateCompletion([{ role: 'user', content: 'test' }], { model: 'gemini-3.5-flash' })
      ).rejects.toThrow('GEMINI_TIMEOUT');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });
  });

  describe('3. AI Service Tests', () => {
    test('getFriendlyError translates error messages to user-friendly Czech text', () => {
      expect(aiService.getFriendlyError(new Error('GEMINI_API_KEY_MISSING'))).toContain('Není nastaven API klíč');
      expect(aiService.getFriendlyError(new Error('GEMINI_INVALID_API_KEY'))).toContain('API klíč pro Gemini je neplatný');
      expect(aiService.getFriendlyError(new Error('GEMINI_RATE_LIMIT'))).toContain('Byl překročen limit dotazů');
      expect(aiService.getFriendlyError(new Error('GEMINI_TIMEOUT'))).toContain('Požadavek na Gemini vypršel');
      expect(aiService.getFriendlyError(new Error('GEMINI_NETWORK_ERROR'))).toContain('Chyba síťového připojení');
    });
  });

  describe('4. Next.js API Route Tests', () => {
    test('POST returns 400 when messages are missing or empty', async () => {
      const request = new NextRequest('http://localhost/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Chybí nebo je neplatný');
    });

    test('POST responds with correct user friendly error mapping upon failure', async () => {
      process.env.GEMINI_API_KEY = 'invalid-key';
      mockGenerateContent.mockRejectedValueOnce(new Error('API key not valid'));

      const request = new NextRequest('http://localhost/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Ahoj' }],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('API klíč pro Gemini je neplatný');
    });
  });

  describe('5. AI Improve Task API Route & JSON parsing Tests', () => {
    test('improvePOST returns 400 when card or card.title is missing', async () => {
      const request = new NextRequest('http://localhost/api/ai/improve', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await improvePOST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('chybí název úkolu');
    });

    test('improvePOST cleans up markdown backticks and correctly parses JSON', async () => {
      process.env.GEMINI_API_KEY = 'valid-key';
      
      mockGenerateContent.mockResolvedValueOnce({
        text: '```json\n{\n  "details": "Vylepšený popis z testu",\n  "acceptanceCriteria": "1. Kritérum A",\n  "risks": "Riziko A",\n  "missingInfo": "Nic nechybí",\n  "checklist": ["položka A", "položka B"]\n}\n```',
        usageMetadata: { promptTokenCount: 15, candidatesTokenCount: 25, totalTokenCount: 40 },
      });

      const request = new NextRequest('http://localhost/api/ai/improve', {
        method: 'POST',
        body: JSON.stringify({
          card: { id: 'task-1', title: 'Testovací úkol', details: 'Původní popis' },
          context: {}
        }),
      });

      const response = await improvePOST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.parsed).toBeDefined();
      expect(data.parsed.details).toBe('Vylepšený popis z testu');
      expect(data.parsed.acceptanceCriteria).toBe('1. Kritérum A');
      expect(data.parsed.risks).toBe('Riziko A');
      expect(data.parsed.missingInfo).toBe('Nic nechybí');
      expect(data.parsed.checklist).toEqual(['položka A', 'položka B']);
    });
  });

  const realKey = process.env.GEMINI_API_KEY;
  if (realKey && realKey !== 'tvuj_api_klic_zde' && realKey !== '') {
    describe('6. Real Gemini Integration Test', () => {
      test('successfully calls real Gemini endpoint', async () => {
        const response = await aiService.executeChat({
          messages: [{ role: 'user', content: 'Ahoj, odpověz jedním slovem: Test' }],
        });
        expect(response.content).toBeDefined();
        console.log('Skutečná odpověď od Gemini:', response.content);
      });
    });
  }
});

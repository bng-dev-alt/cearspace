import { describe, test, expect, vi, beforeEach } from 'vitest';
import { POST as riskAnalysisPOST } from '../app/api/ai/risk-analysis/route';
import { NextRequest } from 'next/server';

const mockGenerateContent = vi.fn().mockResolvedValue({
  text: JSON.stringify({
    executiveSummary: 'Projekt má pevný základ, ale vykazuje chybějící prvky zabezpečení.',
    overallRiskScore: 45,
    biggestRisks: [
      {
        name: 'Chybějící autentizace a HTTPS',
        severity: 'High',
        explanation: 'Aplikace v současné verzi nepoužívá SSL ani uživatelské přihlašování, což ohrožuje bezpečnost dat.',
        recommendation: 'Integrovat standardní autentizační mechanismus a vynutit HTTPS.'
      }
    ],
    bottlenecks: ['Jediný vývojář na všechny úkoly.'],
    missingFeatures: ['Uživatelské profily', 'Fakturace'],
    technicalDebt: ['Nedostatečné testovací pokrytí'],
    securityRisks: ['Data jsou přenášena nešifrovaně.'],
    performanceRisks: ['Chybějící databázové indexy na dotazy.'],
    mvpRecommendations: ['Zaměřit se na základní workflow bez fakturace.'],
    topAiRecommendations: [
      'Integrovat autentizaci jako první krok.',
      'Nastavit automatické CI/CD nasazování.',
      'Doplnit chybějící indexy pro vyhledávání.',
      'Omezit rozsah MVP pouze na 1 board.',
      'Zprovoznit HTTPS certifikát.'
    ]
  }),
  usageMetadata: {
    promptTokenCount: 120,
    candidatesTokenCount: 280,
    totalTokenCount: 400
  }
});

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

describe('AI Risk Analysis Workflow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'valid-key';
  });

  test('POST to /api/ai/risk-analysis validates inputs and returns clean structured JSON response', async () => {
    const validRequest = new NextRequest('http://localhost:3000/api/ai/risk-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectName: 'SaaS Workspace',
        columns: [
          {
            id: 'col-1',
            name: 'Backlog',
            cards: [
              { id: 'card-1', title: 'Task 1', details: 'Details 1', priority: 'High' }
            ]
          }
        ],
        context: { projectName: 'SaaS Workspace' }
      })
    });

    const response = await riskAnalysisPOST(validRequest);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.parsed).toBeDefined();
    expect(data.parsed.overallRiskScore).toBe(45);
    expect(data.parsed.biggestRisks.length).toBe(1);
    expect(data.parsed.biggestRisks[0].severity).toBe('High');
    expect(data.parsed.topAiRecommendations.length).toBe(5);
  });

  test('POST to /api/ai/risk-analysis returns 400 when projectName is missing', async () => {
    const invalidRequest = new NextRequest('http://localhost:3000/api/ai/risk-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        columns: []
      })
    });

    const response = await riskAnalysisPOST(invalidRequest);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Chybí název projektu');
  });
});

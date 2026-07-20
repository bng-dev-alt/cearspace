import { describe, test, expect, vi, beforeEach } from 'vitest';
import { POST as generateSprintPOST } from '../app/api/ai/generate-sprint/route';
import { NextRequest } from 'next/server';

const mockGenerateContent = vi.fn().mockResolvedValue({
  text: JSON.stringify({
    sprintGoal: 'Vyvinout a otestovat základní MVP',
    sprintSummary: 'Tento sprint se zaměřuje na vytvoření základních funkčních komponent a integraci platební brány.',
    recommendedSprintLength: '2 týdny',
    sprintCapacity: '25 SP',
    selectedTasks: [
      {
        id: 'card-1',
        title: 'Inicializace projektu',
        priority: 'High',
        storyPoints: 5,
        estimatedTime: '2d',
        reason: 'Nezbytný základní kámen pro ostatní úkoly.'
      },
      {
        id: 'card-2',
        title: 'Integrace Stripe',
        priority: 'High',
        storyPoints: 8,
        estimatedTime: '4d',
        reason: 'Platební brána má vysokou prioritu pro uvolnění MVP.'
      }
    ],
    dependencies: ['Stripe integrace závisí na inicializaci projektu.'],
    risks: ['Nestabilní internetové připojení k sandbox platební bráně.'],
    outOfScope: [
      {
        id: 'card-3',
        title: 'Optimalizace obrázků',
        reason: 'Optimalizace není kritická pro první funkční verzi.'
      }
    ]
  }),
  usageMetadata: {
    promptTokenCount: 150,
    candidatesTokenCount: 300,
    totalTokenCount: 450
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

describe('AI Sprint Planner Workflow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'valid-key';
  });

  test('POST to /api/ai/generate-sprint validates inputs and returns clean structured JSON response', async () => {
    // 1. Invalid input: missing cards list
    const invalidRequest = new NextRequest('http://localhost/api/ai/generate-sprint', {
      method: 'POST',
      body: JSON.stringify({
        context: { projectName: 'Test' }
      })
    });
    const invalidResponse = await generateSprintPOST(invalidRequest);
    expect(invalidResponse.status).toBe(400);
    const invalidData = await invalidResponse.json();
    expect(invalidData.error.toLowerCase()).toContain('backlog projektu je prázdný');

    // 2. Valid input
    const validRequest = new NextRequest('http://localhost/api/ai/generate-sprint', {
      method: 'POST',
      body: JSON.stringify({
        cards: [
          { id: 'card-1', title: 'Task 1', details: 'Details 1', priority: 'High' },
          { id: 'card-2', title: 'Task 2', details: 'Details 2', priority: 'Medium' }
        ],
        context: { projectName: 'Test Project' }
      })
    });

    const response = await generateSprintPOST(validRequest);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.parsed).toBeDefined();
    expect(data.parsed.sprintGoal).toBe('Vyvinout a otestovat základní MVP');
    expect(data.parsed.selectedTasks.length).toBe(2);
    expect(data.parsed.selectedTasks[0].id).toBe('card-1');
  });
});

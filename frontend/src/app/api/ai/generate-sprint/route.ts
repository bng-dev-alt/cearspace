import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../../services/ai/aiService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cards, context } = body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: 'Backlog projektu je prázdný. Přidejte prosím nějaké úkoly.' },
        { status: 400 }
      );
    }

    const response = await aiService.executeSprintPlanning(cards, context);

    // Parse structured JSON response
    let parsedContent;
    try {
      let cleanText = response.content.trim();
      const thinkIndex = cleanText.lastIndexOf('</think>');
      if (thinkIndex !== -1) {
        cleanText = cleanText.substring(thinkIndex + 8).trim();
      }
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      }
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim();

      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }

      parsedContent = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse AI JSON response in generate-sprint:', response.content, parseError);
      return NextResponse.json(
        { error: 'AI vrátila neplatný formát dat. Zkuste to prosím znovu.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ...response,
      parsed: parsedContent,
    });
  } catch (err: unknown) {
    const error = err as Error;
    const msg = error.message || '';
    let status = 500;

    if (msg.includes('Není nastaven API klíč') || msg.includes('neplatný') || msg.includes('API klíč')) {
      status = 401;
    } else if (msg.includes('překročen limit')) {
      status = 429;
    } else if (msg.includes('vypršel')) {
      status = 504;
    }

    return NextResponse.json({ error: msg || 'Při volání AI na serveru došlo k chybě.' }, { status });
  }
}

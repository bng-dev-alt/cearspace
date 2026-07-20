import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../../services/ai/aiService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, projectDescription, columns, existingTasks, options } = body;

    if (!projectName || !projectName.trim()) {
      return NextResponse.json(
        { error: 'Chybí název projektu.' },
        { status: 400 }
      );
    }

    if (!projectDescription || !projectDescription.trim()) {
      return NextResponse.json(
        { error: 'Chybí popis projektu.' },
        { status: 400 }
      );
    }

    const response = await aiService.executeBacklogGenerate(
      projectName,
      projectDescription,
      columns || [],
      existingTasks || [],
      options
    );

    // Pokusíme se zvalidovat a naparsovat JSON vrácený od AI
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

      // Extrakce JSON těla mezi prvním '{' a posledním '}'
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }
      
      parsedContent = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse AI JSON response in generate-backlog:', response.content, parseError);
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

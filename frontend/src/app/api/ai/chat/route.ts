import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../../services/ai/aiService';
import { AiRequest } from '../../../../services/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body: AiRequest = await req.json();

    if (!body || !body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Chybí nebo je neplatný parametr "messages" v těle požadavku.' },
        { status: 400 }
      );
    }

    const result = await aiService.executeChat(body);
    return NextResponse.json(result);
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

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY missing' }, { status: 400 });
    }

    const model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
    const selectedVoice = typeof voice === 'string' && voice ? voice : (process.env.OPENAI_TTS_VOICE || 'alloy');

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        voice: selectedVoice,
        input: text,
        format: 'mp3',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: 'tts_error', message: errText },
        { status: res.status }
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'tts_error', message: String(error?.message || error) },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';



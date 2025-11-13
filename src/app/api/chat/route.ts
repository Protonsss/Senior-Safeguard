// Web chat API endpoint (similar to IVR but for web interface)
import { NextRequest, NextResponse } from 'next/server';
import { Language } from '@/lib/i18n';
import { orchestrate } from '@/lib/ivr/orchestrator';
import { nanoid } from 'nanoid';

// In-memory session store for web chats (in production, use Redis)
const webSessions = new Map<string, { sessionId: string; language: Language; messages: any[] }>();

function detectLanguageFromText(text: string, req: NextRequest): Language {
  // Script-based quick detection
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // CJK
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  // Header hint
  const header = req.headers.get('accept-language') || '';
  if (/zh/i.test(header)) return 'zh';
  if (/(hi|hind)/i.test(header)) return 'hi';
  if (/(ta|tamil)/i.test(header)) return 'ta';
  return 'en';
}

export async function POST(request: NextRequest) {
  try {
    const { message, language, sessionId: clientSessionId, history, screenContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create session
    let sessionId = clientSessionId;
    if (!sessionId) {
      sessionId = nanoid();
    }

    // Auto language detection - ALWAYS detect from text to support multi-language conversations
    const resolvedLanguage: Language = language ? (language as Language) : detectLanguageFromText(message, request);

    if (!webSessions.has(sessionId)) {
      webSessions.set(sessionId, {
        sessionId,
        language: resolvedLanguage,
        messages: [],
      });
    }

    const session = webSessions.get(sessionId)!;
    
    // ALWAYS update session language based on current message detection
    // This allows seamless language switching within the same conversation
    session.language = resolvedLanguage;
    
    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // If screen context is provided, enhance the message with visual context
    let enhancedMessage = message;
    if (screenContext) {
      console.log('[Chat] Screen context provided - analyzing with GPT-4 Vision...');
      try {
        const visionResponse = await fetch(`${request.nextUrl.origin}/api/vision/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            image: screenContext,
            prompt: `I can see the senior's screen. User question: "${message}". First, identify EXACTLY what application/website they're using (be specific: Google Meet, Zoom, Gmail, etc). Then answer their question based on what you see on their screen. Be direct and helpful.`,
            language: resolvedLanguage
          }),
        });
        
        if (visionResponse.ok) {
          const visionData = await visionResponse.json();
          enhancedMessage = `[AI VISION - I can see their screen: ${visionData.analysis}]\n\nTheir question: "${message}"\n\nRespond directly to their question using what you see on screen. Be specific about the application and what they should do.`;
          console.log('[Chat] ✅ Enhanced message with screen analysis');
        }
      } catch (error) {
        console.error('[Chat] ❌ Failed to analyze screen context:', error);
      }
    }

    // Use orchestrator to generate response
    // For web, we create a temporary callSid-like identifier
    const tempCallSid = `WEB_${sessionId}`;
    
    // Use the freshly detected language, not stale session language
    const response = await orchestrate(tempCallSid, enhancedMessage, resolvedLanguage, session.messages.slice(0, -1));

    // Add assistant message
    session.messages.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: response.message,
      sessionId,
      action: response.action,
    });
  } catch (error: any) {
    // Surface useful debugging info to the UI and logs
    const errMessage = typeof error?.message === 'string' ? error.message : 'Unknown error';
    const errCode = error?.code || error?.status || error?.statusCode || 500;
    const provider = 'groq';

    console.error('Error in chat API:', {
      provider,
      code: errCode,
      message: errMessage,
      raw: error,
    });

    return NextResponse.json(
      {
        error: 'ai_error',
        message: `I ran into a technical issue (${provider}:${errCode}).`,
        debug: errMessage,
      },
      { status: Number(errCode) >= 400 && Number(errCode) < 600 ? Number(errCode) : 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


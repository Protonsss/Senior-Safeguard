// Twilio IVR Voice webhook handler
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { getSession, detectLanguage, setLanguage, addMessage } from '@/lib/ivr/session-manager';
import { orchestrate } from '@/lib/ivr/orchestrator';
import { t, Language, isLanguageSupported } from '@/lib/i18n';

const VoiceResponse = twilio.twiml.VoiceResponse;

/**
 * Simple in-memory rate limiter (replace with Redis in production)
 * Limits to 60 requests per minute per IP
 */
interface RateLimitRecord {
  count: number;
  timestamp: number;
}

// Store rate limit data in global scope (persists across requests in same instance)
const rateLimitStore = new Map<string, RateLimitRecord>();

function checkRateLimit(request: NextRequest): boolean {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 60; // 60 requests per minute
  
  const record = rateLimitStore.get(clientIp);
  
  if (!record || now - record.timestamp > windowMs) {
    // New window - reset counter
    rateLimitStore.set(clientIp, { count: 1, timestamp: now });
    return true;
  }
  
  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return false;
  }
  
  // Increment counter
  record.count++;
  rateLimitStore.set(clientIp, record);
  
  // Clean up old entries periodically (every 100 requests)
  if (rateLimitStore.size > 100) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now - value.timestamp > windowMs * 2) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  return true;
}

/**
 * Validate Twilio webhook signature for security
 */
function validateTwilioSignature(request: NextRequest, params: Record<string, string>): boolean {
  // Skip validation in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const signature = request.headers.get('x-twilio-signature') || '';
  
  // Use the exact URL Twilio hit to avoid mismatch with custom domains, ngrok, etc.
  let url = request.nextUrl.toString();
  
  // If behind a proxy forcing http, normalize to https if needed
  if (url.startsWith('http://') && process.env.FORCE_TWILIO_HTTPS === 'true') {
    url = url.replace('http://', 'https://');
  }
  
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    console.error('TWILIO_AUTH_TOKEN not set');
    return false;
  }

  return twilio.validateRequest(authToken, signature, url, params);
}

/**
 * Main IVR voice webhook - handles incoming calls
 * POST /api/ivr/voice
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Convert formData to params object for signature validation
    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      params[key] = String(value);
    }

    // Validate Twilio signature
    if (!validateTwilioSignature(request, params)) {
      console.error('Invalid Twilio signature');
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check rate limit
    if (!checkRateLimit(request)) {
      console.warn('Rate limit exceeded');
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const speechResult = formData.get('SpeechResult') as string;
    const digits = formData.get('Digits') as string;

    const twiml = new VoiceResponse();

    // Get or create session
    const session = await getSession(callSid, from);

    // First call - greeting
    if (!speechResult && !digits) {
      return await handleInitialGreeting(twiml, session);
    }

    // Handle DTMF digits
    if (digits) {
      // Press 0 to repeat last message
      if (digits === '0') {
        const lastMessage = session.conversationHistory?.slice().reverse().find(m => m.role === 'assistant');
        const lang = session.language as Language;
        const voiceConfig = getVoiceConfig(lang) as any;
        
        if (lastMessage) {
          twiml.say(voiceConfig, lastMessage.content);
        } else {
          twiml.say(voiceConfig, t(lang, 'common.slow_down'));
        }
        
        // Continue listening
        const gather = twiml.gather({
          input: ['speech', 'dtmf'],
          language: getTwilioLanguage(lang) as any,
          timeout: 5,
          speechTimeout: 'auto',
          numDigits: 1,
          action: '/api/ivr/voice',
          method: 'POST',
        });
        gather.say(voiceConfig, t(lang, 'common.repeat'));
        
        return new NextResponse(twiml.toString(), {
          headers: { 'Content-Type': 'text/xml' },
        });
      }
      
      // Language menu selection - only when in auto detection mode
      if (session.languageDetectionMethod === 'auto') {
        return await handleLanguageSelection(twiml, digits, callSid);
      }
      
      // Ignore other digits if language already set
    }

    // User spoke something
    if (speechResult) {
      return await handleUserSpeech(twiml, callSid, speechResult, session.language);
    }

    // Default fallback
    twiml.say({ voice: 'alice', language: 'en-US' }, t('en', 'errors.not_understand'));
    twiml.redirect('/api/ivr/voice');

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Error in voice webhook:', error);
    
    const twiml = new VoiceResponse();
    twiml.say({ voice: 'alice', language: 'en-US' }, 'I\'m having technical difficulties. Please try again later.');
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

/**
 * Handle initial greeting when call starts
 */
async function handleInitialGreeting(
  twiml: any,
  session: any
): Promise<NextResponse> {
  const language = session.language as Language;

  // If we have saved language, greet directly
  if (session.languageDetectionMethod === 'saved') {
    const greeting = t(language, 'greeting.returning');
    const voiceConfig = getVoiceConfig(language);

    twiml.say(voiceConfig, greeting);
    await addMessage(session.callSid, 'assistant', greeting);

    // Listen for user input
    const gather = twiml.gather({
      input: ['speech'],
      language: getTwilioLanguage(language) as any,
      timeout: 5,
      speechTimeout: 'auto',
      action: '/api/ivr/voice',
      method: 'POST',
    });

    gather.say(voiceConfig, t(language, 'common.slow_down'));

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // New user - try auto-detection first, then menu
  const greeting = t('en', 'greeting.welcome');
  twiml.say({ voice: 'alice', language: 'en-US' }, greeting);
  
  // Save greeting so "Press 0 to repeat" works from the very first prompt
  await addMessage(session.callSid, 'assistant', greeting);

  // Try to detect language from first response
  const gather = twiml.gather({
    input: ['speech', 'dtmf'],
    timeout: 5,
    speechTimeout: 'auto',
    numDigits: 1,
    action: '/api/ivr/voice',
    method: 'POST',
  });

  // Offer language menu
  gather.say({ voice: 'alice', language: 'en-US' }, t('en', 'language_detection.menu'));

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}

/**
 * Handle language selection from menu
 */
async function handleLanguageSelection(
  twiml: any,
  digits: string,
  callSid: string
): Promise<NextResponse> {
  const languageMap: Record<string, Language> = {
    '1': 'en',
    '2': 'zh',
    '3': 'hi',
    '4': 'ta',
  };

  const language = languageMap[digits] || 'en';
  await setLanguage(callSid, language);

  const voiceConfig = getVoiceConfig(language);
  const confirmation = t(language, 'language_detection.language_set');
  
  twiml.say(voiceConfig, confirmation);
  twiml.pause({ length: 1 });

  const greeting = t(language, 'greeting.welcome');
  twiml.say(voiceConfig, greeting);

  // Start listening
  const gather = twiml.gather({
    input: ['speech'],
    language: getTwilioLanguage(language) as any,
    timeout: 5,
    speechTimeout: 'auto',
    action: '/api/ivr/voice',
    method: 'POST',
  });

  gather.say(voiceConfig, t(language, 'common.slow_down'));

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}

/**
 * Handle user speech input
 */
async function handleUserSpeech(
  twiml: any,
  callSid: string,
  speechResult: string,
  language: Language
): Promise<NextResponse> {
  // Auto-detect language if not already set
  const detectedLang = await detectLanguage(callSid, speechResult);
  const finalLanguage = detectedLang || language;

  // Orchestrate response
  const response = await orchestrate(callSid, speechResult, finalLanguage);

  const voiceConfig = getVoiceConfig(finalLanguage);
  twiml.say(voiceConfig, response.message);

  // Check if should end call
  if (response.shouldEnd) {
    twiml.say(voiceConfig, t(finalLanguage, 'goodbye.end_call'));
    twiml.hangup();
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // Continue listening
  const gather = twiml.gather({
    input: ['speech', 'dtmf'],
    language: getTwilioLanguage(finalLanguage) as any,
    timeout: 5,
    speechTimeout: 'auto',
    numDigits: 1,
    action: '/api/ivr/voice',
    method: 'POST',
  });

  gather.say(voiceConfig, t(finalLanguage, 'common.repeat'));

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}

/**
 * Get Twilio voice configuration for language
 */
function getVoiceConfig(language: Language): { voice: string; language: string } {
  const configs: Record<Language, { voice: string; language: string }> = {
    en: { voice: 'Polly.Joanna', language: 'en-US' },
    zh: { voice: 'Polly.Zhiyu', language: 'cmn-CN' },
    hi: { voice: 'Polly.Aditi', language: 'hi-IN' },
    // Polly.Aditi does not support Tamil - using Twilio's default 'alice' with Tamil language code
    // TODO: Replace with a verified Tamil voice when available (Google TTS Tamil voice)
    ta: { voice: 'alice', language: 'ta-IN' },
  };

  return configs[language] || configs.en;
}

/**
 * Get Twilio language code for speech recognition
 */
function getTwilioLanguage(language: Language): string {
  const codes: Record<Language, string> = {
    en: 'en-US',
    zh: 'zh-CN',
    hi: 'hi-IN',
    ta: 'ta-IN',
  };

  return codes[language] || 'en-US';
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


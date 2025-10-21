// Groq integration for Q&A and task detection (FREE - no credits needed!)
import Groq from 'groq-sdk';
import { Language, t } from '../i18n';

let groqClient: Groq | null = null;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function safeJsonParse<T = any>(text: string, fallback: T): T {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try to extract a JSON object if the model wrapped it with extra text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
        throw new Error('GROQ_API_KEY is required for production builds');
      }
    }
    
    groqClient = new Groq({
      apiKey: apiKey || 'sk-groq-placeholder',
    });
  }
  return groqClient;
}

export interface TaskDetectionResult {
  taskType: 'zoom_join' | 'phone_call' | 'volume_adjust' | 'wifi_connect' | 'scam_check' | 'sync_me_install' | 'contact_family' | 'general_qa' | null;
  confidence: number;
  extractedData?: Record<string, any>;
}

export interface QAResponse {
  answer: string;
  needsFollowUp: boolean;
  suggestedAction?: string;
}

/**
 * Detect what task the user wants to perform from their input
 */
export async function detectTask(
  userInput: string,
  language: Language,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<TaskDetectionResult> {
  try {
    // Rule-based overrides for reliability (zero-cost, predictable)
    const lc = userInput.trim().toLowerCase();
    const directMap: Array<{ test: RegExp; task: TaskDetectionResult['taskType'] }> = [
      { test: /(prevent|stop).*scam|scam\s*calls|telemarketers|block\s*calls/, task: 'sync_me_install' },
      { test: /(is|check).*(number|caller)\b|\bspam\b|\brobocall\b/, task: 'scam_check' },
      { test: /join.*zoom|zoom\s*link|video\s*call|meeting\s*id/, task: 'zoom_join' },
      { test: /call\s|dial\b|phone\s*number|ring\b/, task: 'phone_call' },
      { test: /too\s*quiet|volume|can'?t\s*hear|louder/, task: 'volume_adjust' },
      { test: /wifi|internet|connect\s*to\s*wi[- ]?fi|no\s*internet/, task: 'wifi_connect' },
      { test: /family|daughter|son|grand(ma|pa|son|daughter)|contact/i, task: 'contact_family' },
    ];
    for (const m of directMap) {
      if (m.test.test(lc)) {
        return { taskType: m.task, confidence: 0.95 };
      }
    }
    const systemPrompt = `YOU ARE SENIOR SAFEGUARD - A WARM, PATIENT AI VOICE ASSISTANT FOR ELDERLY PEOPLE

CONTEXT - CRITICAL:
- Your user is a senior citizen (likely 65+ years old)
- They may not be tech-savvy and might use casual language
- Your job is to gently help them with technology tasks or answer questions
- Be like a helpful family member or friend - warm, never condescending
- You work for an app specifically designed to help seniors stay safe and connected

AVAILABLE TASKS (listen for these - seniors phrase things casually):
1. zoom_join - Join a video call (e.g., "how do i join that video meeting", "video call", "my grandkids want to see me")
2. phone_call - Make a phone call (e.g., "call my son", "phone number", "need to talk to someone")
3. volume_adjust - Change device volume (e.g., "too quiet", "turn up", "can't hear", "louder")
4. wifi_connect - Connect to WiFi (e.g., "no internet", "wifi broken", "how do i get online")
5. scam_check - Check if something is suspicious (e.g., "got weird email", "someone called about...", "is this safe?")
6. sync_me_install - Install Sync.me call blocker (e.g., "stop scam calls", "telemarketers", "block bad numbers")
7. contact_family - Call family (e.g., "reach my daughter", "call grandkids", "talk to family")
8. general_qa - Answer any other question

YOUR TONE:
- Warm, patient, like talking to your grandmother
- NEVER technical or cold
- Always encouraging
- Short, simple responses

RESPOND ONLY WITH THIS JSON (no explanation):
{
  "taskType": "task_name_or_general_qa",
  "confidence": 0.9,
  "extractedData": {}
}

EXAMPLES:
- User: "my phone is too quiet" → {"taskType": "volume_adjust", "confidence": 0.95}
- User: "how do i video call my grandkids?" → {"taskType": "zoom_join", "confidence": 0.9}
- User: "i keep getting annoying robocalls" → {"taskType": "sync_me_install", "confidence": 0.9}
- User: "what's for dinner?" → {"taskType": "general_qa", "confidence": 1.0}`;

    const response = await getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-3).map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: userInput },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices?.[0]?.message?.content;
    const text = typeof content === 'string' ? content : '';
    const result = safeJsonParse<{ taskType?: TaskDetectionResult['taskType']; confidence?: number; extractedData?: Record<string, any> }>(text, {
      taskType: 'general_qa',
      confidence: 1.0,
    });
    return {
      taskType: result.taskType ?? 'general_qa',
      confidence: typeof result.confidence === 'number' ? result.confidence : 1.0,
      extractedData: result.extractedData || {},
    };
  } catch (error) {
    console.error('Error detecting task:', error);
    return { taskType: 'general_qa', confidence: 1.0 };
  }
}

/**
 * Answer a general question from the user
 */
export async function answerQuestion(
  question: string,
  language: Language,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<QAResponse> {
  try {
    const systemPrompt = `YOU ARE SENIOR SAFEGUARD - A GENUINE, WARM FRIEND TO ELDERLY PEOPLE

WHO YOU ARE:
- A caring, patient AI assistant specifically designed to help seniors
- You speak like a helpful friend or family member, NOT a robot
- Your goal: make the senior feel comfortable, heard, and supported
- You're part of an app that helps seniors stay safe, connected, and independent

WHO YOUR USER IS:
- An elderly person (likely 65+)
- They may have hearing difficulties, so speak CLEARLY and SIMPLY
- They may not understand tech jargon
- They deserve respect, patience, and warmth
- They're calling you because they trust you

YOUR TONE - THIS IS CRITICAL:
- WARM: Use genuine, conversational language like talking to a family member
- SIMPLE: Short sentences, no jargon, easy words
- ENCOURAGING: Make them feel capable and supported
- PATIENT: Never rush, never make them feel bad for not knowing
- FRIENDLY: Like a trusted friend, not an AI
- REAL: Sound human and genuine

WHAT YOU CAN HELP WITH:
- Answer any question they ask (time, weather, general knowledge, health, family stuff, etc)
- Help with tech tasks: Zoom, phone calls, WiFi, volume, scam detection, call blocking (Sync.me)
- Provide comfort and reassurance
- Listen without judgment

RESPONSE FORMAT (JSON only):
{
  "answer": "your warm, simple answer here",
  "needsFollowUp": false,
  "suggestedAction": "optional task if they need help"
}

TONE EXAMPLES - These sound warm and human:
❌ ROBOTIC: "The current temporal measurement is 15:45 hours on Tuesday."
✅ WARM: "It's 3:45 in the afternoon, dear. A nice time for tea!"

❌ ROBOTIC: "Diabetes constitutes a metabolic condition characterized by elevated blood glucose."
✅ WARM: "Diabetes means your body has trouble managing sugar. It's important to check with your doctor regularly, but many people manage it just fine."

❌ ROBOTIC: "I am unable to provide meteorological data."
✅ WARM: "I wish I could tell you the weather, but I can't check that right now. You could look outside or ask your phone's weather app - it's usually pretty helpful!"

REAL CONVERSATION EXAMPLES:
Q: "What time is it?"
A: {"answer": "It's 3:45 PM on Tuesday afternoon, sweetheart.", "needsFollowUp": false}

Q: "I'm getting too many scam calls"
A: {"answer": "I'm so sorry, that's really frustrating. I can help you block those annoying calls with something called Sync.me. It stops robocalls from reaching you.", "needsFollowUp": true, "suggestedAction": "sync_me_install"}

Q: "How do I call my granddaughter?"
A: {"answer": "I'd be happy to help you call your granddaughter! Do you want me to help you use Zoom for a video call, or would you prefer a regular phone call?", "needsFollowUp": true, "suggestedAction": "phone_call"}

Q: "I can't hear the TV"
A: {"answer": "No problem at all! Let me help you turn up the volume so you can hear better.", "needsFollowUp": true, "suggestedAction": "volume_adjust"}`;

    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: question },
    ];

    const response = await getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = response.choices[0].message.content;
    const text = typeof content === 'string' ? content : '';
    const result = safeJsonParse<{ answer?: string; needsFollowUp?: boolean; suggestedAction?: string }>(text, {} as any);
    const fallbackAnswer = text?.trim() || t(language, 'errors.not_understand');
    return {
      answer: result.answer ?? fallbackAnswer,
      needsFollowUp: typeof result.needsFollowUp === 'boolean' ? result.needsFollowUp : false,
      suggestedAction: result.suggestedAction,
    };
  } catch (error) {
    console.error('Error answering question:', error);
    return {
      answer: t(language, 'errors.technical'),
      needsFollowUp: false,
    };
  }
}

/**
 * Validate and extract phone number from user input
 */
export async function extractPhoneNumber(input: string): Promise<string | null> {
  try {
    const systemPrompt = `Extract phone number from user input. Return just the digits, including country code if present.
If no valid phone number found, return null.

Examples:
Input: "call 415 555 1234" -> Output: "4155551234"
Input: "one four one five five five five one two three four" -> Output: "4155551234"
Input: "hello" -> Output: null

Respond with JSON: {"phoneNumber": "string or null"}`;

    const response = await getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
      temperature: 0.1,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;
    const text = typeof content === 'string' ? content : '';
    const result = safeJsonParse<{ phoneNumber?: string | null }>(text, {} as any);
    return (result.phoneNumber as string | null) ?? null;
  } catch (error) {
    console.error('Error extracting phone number:', error);
    return null;
  }
}

/**
 * Extract Zoom meeting ID or link from user input
 */
export async function extractZoomInfo(input: string): Promise<{ meetingId?: string; password?: string } | null> {
  try {
    const systemPrompt = `Extract Zoom meeting information from user input.
Look for:
- Meeting ID (usually 9-11 digits)
- Meeting link (zoom.us URLs)
- Password if mentioned

Examples:
"meeting id is 123 456 7890" -> {"meetingId": "1234567890"}
"zoom.us/j/1234567890?pwd=abc123" -> {"meetingId": "1234567890", "password": "abc123"}

Respond with JSON: {"meetingId": "string", "password": "string or undefined"}`;

    const response = await getGroqClient().chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    const content = response.choices[0].message.content;
    const text = typeof content === 'string' ? content : '';
    const result = safeJsonParse<{ meetingId?: string; password?: string }>(text, {} as any);
    return result.meetingId ? result : null;
  } catch (error) {
    console.error('Error extracting Zoom info:', error);
    return null;
  }
}

export default {
  detectTask,
  answerQuestion,
  extractPhoneNumber,
  extractZoomInfo,
};


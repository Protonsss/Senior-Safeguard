// IVR session management
import { getServiceRoleClient } from '../supabase/client';
import { Language, detectLanguageFromText, isLanguageSupported } from '../i18n';

export interface IVRSession {
  id: string;
  seniorId: string;
  language: Language;
  languageDetectionMethod: 'auto' | 'menu' | 'saved';
  phoneNumber: string;
  callSid: string;
  currentTaskType?: string;
  currentTaskStep?: number;
  taskState?: any;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  startedAt: Date;
}

const activeSessions = new Map<string, IVRSession>();

/**
 * Get or create IVR session for a call
 */
export async function getSession(callSid: string, phoneNumber: string): Promise<IVRSession> {
  // Check if session already exists in memory
  if (activeSessions.has(callSid)) {
    return activeSessions.get(callSid)!;
  }

  // Try to find senior by phone number
  const senior = await findSeniorByPhone(phoneNumber);
  
  // Get saved language preference if senior exists
  let language: Language = 'en';
  let detectionMethod: 'auto' | 'menu' | 'saved' = 'auto';
  
  if (senior) {
    language = senior.preferredLanguage || 'en';
    detectionMethod = 'saved';
  }

  // Create new session
  const session: IVRSession = {
    id: `session_${Date.now()}`,
    seniorId: senior?.id || 'unknown',
    language,
    languageDetectionMethod: detectionMethod,
    phoneNumber,
    callSid,
    conversationHistory: [],
    startedAt: new Date(),
  };

  activeSessions.set(callSid, session);

  // Save to database
  await saveSessionToDb(session);

  return session;
}

/**
 * Update session in memory and database
 */
export async function updateSession(callSid: string, updates: Partial<IVRSession>): Promise<void> {
  const session = activeSessions.get(callSid);
  if (!session) return;

  Object.assign(session, updates);
  activeSessions.set(callSid, session);

  // Update in database (async, don't wait)
  updateSessionInDb(session).catch(console.error);
}

/**
 * Add message to conversation history
 */
export async function addMessage(
  callSid: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const session = activeSessions.get(callSid);
  if (!session) return;

  session.conversationHistory.push({ role, content });
  
  // Save to database
  await saveConversationMessage(session, role, content);
}

/**
 * Detect language from user speech
 */
export async function detectLanguage(
  callSid: string,
  userSpeech: string
): Promise<Language> {
  const session = activeSessions.get(callSid);
  if (!session) return 'en';

  // If language has already been explicitly chosen (saved or menu), don't override
  if (session.languageDetectionMethod !== 'auto') {
    return session.language;
  }

  // Detect from text
  const detectedLang = detectLanguageFromText(userSpeech);
  
  // Update session
  await updateSession(callSid, {
    language: detectedLang,
    languageDetectionMethod: 'auto',
  });

  // Save language preference
  if (session.seniorId && session.seniorId !== 'unknown') {
    await saveLanguagePreference(session.seniorId, detectedLang, 'auto');
  }

  return detectedLang;
}

/**
 * Set language manually (from menu selection)
 */
export async function setLanguage(callSid: string, language: Language): Promise<void> {
  await updateSession(callSid, {
    language,
    languageDetectionMethod: 'menu',
  });

  const session = activeSessions.get(callSid);
  if (session?.seniorId && session.seniorId !== 'unknown') {
    await saveLanguagePreference(session.seniorId, language, 'menu');
  }
}

/**
 * End session and cleanup
 */
export async function endSession(callSid: string): Promise<void> {
  const session = activeSessions.get(callSid);
  if (!session) return;

  // Mark session as ended in database
  await endSessionInDb(callSid);

  // Remove from memory
  activeSessions.delete(callSid);
}

/**
 * Find senior by phone number
 */
async function findSeniorByPhone(phoneNumber: string): Promise<{ id: string; preferredLanguage?: Language } | null> {
  try {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, preferred_language, seniors(id)')
      .eq('phone_number', phoneNumber)
      .eq('role', 'senior')
      .single();

    if (error || !data || !data.seniors || data.seniors.length === 0) {
      return null;
    }

    return {
      id: data.seniors[0].id,
      preferredLanguage: isLanguageSupported(data.preferred_language) ? data.preferred_language : undefined,
    };
  } catch (error) {
    console.error('Error finding senior by phone:', error);
    return null;
  }
}

/**
 * Save session to database
 */
async function saveSessionToDb(session: IVRSession): Promise<void> {
  try {
    if (session.seniorId === 'unknown') return;

    const supabase = getServiceRoleClient();
    await supabase.from('sessions').insert({
      senior_id: session.seniorId,
      session_type: 'ivr',
      language: session.language,
      language_detected_method: session.languageDetectionMethod,
      phone_number: session.phoneNumber,
      call_sid: session.callSid,
      started_at: session.startedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error saving session to DB:', error);
  }
}

/**
 * Update session in database
 */
async function updateSessionInDb(session: IVRSession): Promise<void> {
  try {
    if (session.seniorId === 'unknown') return;

    const supabase = getServiceRoleClient();
    await supabase
      .from('sessions')
      .update({
        language: session.language,
        language_detected_method: session.languageDetectionMethod,
      })
      .eq('call_sid', session.callSid);
  } catch (error) {
    console.error('Error updating session in DB:', error);
  }
}

/**
 * End session in database
 */
async function endSessionInDb(callSid: string): Promise<void> {
  try {
    const supabase = getServiceRoleClient();
    const session = activeSessions.get(callSid);
    if (!session) return;

    const duration = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

    await supabase
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
      })
      .eq('call_sid', callSid);
  } catch (error) {
    console.error('Error ending session in DB:', error);
  }
}

/**
 * Save conversation message to database
 */
async function saveConversationMessage(
  session: IVRSession,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  try {
    if (session.seniorId === 'unknown') return;

    const supabase = getServiceRoleClient();
    
    // Get session ID from database
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('id')
      .eq('call_sid', session.callSid)
      .single();

    if (!sessionData) return;

    await supabase.from('conversations').insert({
      session_id: sessionData.id,
      senior_id: session.seniorId,
      message_type: role,
      content,
      language: session.language,
    });
  } catch (error) {
    console.error('Error saving conversation message:', error);
  }
}

/**
 * Save language preference
 */
async function saveLanguagePreference(
  seniorId: string,
  language: Language,
  method: 'auto' | 'menu'
): Promise<void> {
  try {
    const supabase = getServiceRoleClient();

    // Look up the associated profile_id for this senior
    const { data: senior } = await supabase
      .from('seniors')
      .select('profile_id')
      .eq('id', seniorId)
      .single();

    if (senior?.profile_id) {
      // Update the profile's preferred language
      await supabase
        .from('profiles')
        .update({ preferred_language: language })
        .eq('id', senior.profile_id);
    }

    // Log preference change
    await supabase.from('language_preferences').insert({
      senior_id: seniorId,
      language,
      detection_method: method,
      confidence_score: method === 'menu' ? 1.0 : 0.85,
    });
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
}

export default {
  getSession,
  updateSession,
  addMessage,
  detectLanguage,
  setLanguage,
  endSession,
};


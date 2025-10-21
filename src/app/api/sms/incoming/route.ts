// Twilio SMS webhook handler
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { detectLanguageFromText, t, Language } from '@/lib/i18n';
import { detectTask, answerQuestion } from '@/lib/ai/openai';
import { checkPhoneNumber } from '@/lib/scam/syncme';
import { getServiceRoleClient } from '@/lib/supabase/client';

const MessagingResponse = twilio.twiml.MessagingResponse;

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
 * Handle incoming SMS messages
 * POST /api/sms/incoming
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

    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    const twiml = new MessagingResponse();

    // Detect language
    const language = detectLanguageFromText(body);

    // Find senior by phone
    const senior = await findSeniorByPhone(from);

    // Log SMS
    await logSMS(senior?.id, 'inbound', from, body, language, messageSid);

    // Handle commands
    const command = body.trim().toUpperCase();

    if (command === 'HELP' || command === 'MENU') {
      const message = getSMSMenu(language);
      twiml.message(message);
    } else if (command.startsWith('BLOCK ')) {
      // Block a phone number
      const phoneNumber = command.replace('BLOCK ', '').trim();
      
      if (phoneNumber && senior?.id) {
        const { blockPhoneNumber } = await import('@/lib/scam/syncme');
        const blocked = await blockPhoneNumber(senior.id, phoneNumber);
        
        if (blocked) {
          twiml.message(`✅ ${t(language, 'scam_shield.blocked')} ${phoneNumber}`);
          
          // Log the block
          await logScamCheck(senior.id, {
            phoneNumber,
            isScam: true,
            riskLevel: 'high',
            blocked: true,
            details: { source: 'sms_block_command' },
          });
        } else {
          twiml.message(`⚠️ Could not block ${phoneNumber}. Please try again.`);
        }
      } else {
        twiml.message('Please send: BLOCK 18005551234');
      }
    } else if (command.startsWith('CHECK ')) {
      // Scam check command: "CHECK 4155551234"
      const phoneNumber = command.replace('CHECK ', '').trim();
      const result = await checkPhoneNumber(phoneNumber);
      
      let message: string;
      if (result.isScam) {
        message = t(language, 'tasks.scam_check.warning', { 
          reports: result.reportCount.toString() 
        });
      } else {
        message = t(language, 'tasks.scam_check.safe', { 
          reports: result.reportCount.toString() 
        });
      }
      
      twiml.message(message);

      if (senior?.id) {
        await logScamCheck(senior.id, result);
      }
    } else if (command === 'STATUS') {
      // Get user status
      if (senior) {
        const status = await getSeniorStatus(senior.id, language);
        twiml.message(status);
      } else {
        twiml.message(t(language, 'errors.not_understand'));
      }
    } else {
      // General question - use AI
      const taskDetection = await detectTask(body, language);
      
      if (taskDetection.taskType === 'scam_check' && taskDetection.extractedData?.phoneNumber) {
        // Handle scam check
        const result = await checkPhoneNumber(taskDetection.extractedData.phoneNumber);
        let message: string;
        if (result.isScam) {
          message = t(language, 'tasks.scam_check.warning', { 
            reports: result.reportCount.toString() 
          });
        } else {
          message = t(language, 'tasks.scam_check.no_data');
        }
        twiml.message(message);
      } else if (taskDetection.taskType && taskDetection.taskType !== 'general_qa') {
        // Task requires calling in
        const message = `${t(language, 'common.understood')} ${t(language, 'tasks.' + taskDetection.taskType + '.name')}. Please call us for step-by-step help.`;
        twiml.message(message);
      } else {
        // Answer general question
        const answer = await answerQuestion(body, language);
        twiml.message(answer.answer);
      }
    }

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Error in SMS webhook:', error);
    
    const twiml = new MessagingResponse();
    twiml.message('Sorry, I\'m having technical difficulties. Please try again or call us.');

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

/**
 * Get SMS menu text
 */
function getSMSMenu(language: Language): string {
  const menus: Record<Language, string> = {
    en: `Senior Safeguard SMS Helper:
• Text any question to get help
• "CHECK [phone]" - Check if number is scam
• "STATUS" - Get your status
• "HELP" - Show this menu
Call us anytime for step-by-step help!`,
    zh: `老年卫士短信助手：
• 发送任何问题获取帮助
• "CHECK [电话]" - 检查号码是否诈骗
• "STATUS" - 获取您的状态
• "HELP" - 显示此菜单
随时致电获取分步帮助！`,
    hi: `सीनियर सेफगार्ड SMS सहायक:
• मदद के लिए कोई भी प्रश्न टेक्स्ट करें
• "CHECK [फोन]" - नंबर घोटाला है या नहीं जांचें
• "STATUS" - अपनी स्थिति प्राप्त करें
• "HELP" - यह मेनू दिखाएं
कदम-दर-कदम मदद के लिए किसी भी समय कॉल करें!`,
    ta: `சீனியர் சேஃப்கார்டு SMS உதவியாளர்:
• உதவிக்கு எந்த கேள்வியும் டெக்ஸ்ட் செய்யுங்கள்
• "CHECK [போன்]" - எண் மோசடியா என சரிபார்க்கவும்
• "STATUS" - உங்கள் நிலையைப் பெறவும்
• "HELP" - இந்த மெனுவைக் காட்டு
படிப்படியான உதவிக்கு எந்த நேரத்திலும் அழையுங்கள்!`,
  };

  return menus[language] || menus.en;
}

/**
 * Find senior by phone number
 */
async function findSeniorByPhone(phoneNumber: string): Promise<{ id: string } | null> {
  try {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, seniors(id)')
      .eq('phone_number', phoneNumber)
      .eq('role', 'senior')
      .single();

    if (error || !data || !data.seniors || data.seniors.length === 0) {
      return null;
    }

    return { id: data.seniors[0].id };
  } catch (error) {
    console.error('Error finding senior by phone:', error);
    return null;
  }
}

/**
 * Log SMS message
 */
async function logSMS(
  seniorId: string | undefined,
  direction: 'inbound' | 'outbound',
  phoneNumber: string,
  body: string,
  language: Language,
  messageSid: string
): Promise<void> {
  try {
    if (!seniorId) return;

    const supabase = getServiceRoleClient();
    await supabase.from('sms_messages').insert({
      senior_id: seniorId,
      direction,
      from_number: direction === 'inbound' ? phoneNumber : process.env.TWILIO_PHONE_NUMBER,
      to_number: direction === 'inbound' ? process.env.TWILIO_PHONE_NUMBER : phoneNumber,
      message_body: body,
      language,
      message_sid: messageSid,
      status: 'received',
    });
  } catch (error) {
    console.error('Error logging SMS:', error);
  }
}

/**
 * Log scam check
 */
async function logScamCheck(seniorId: string, result: any): Promise<void> {
  try {
    const supabase = getServiceRoleClient();
    await supabase.from('scam_logs').insert({
      senior_id: seniorId,
      phone_number: result.phoneNumber,
      caller_name: result.callerName,
      scam_risk_level: result.riskLevel,
      scam_type: result.scamType,
      blocked: false,
      source: 'sync_me',
      details: result.details,
    });
  } catch (error) {
    console.error('Error logging scam check:', error);
  }
}

/**
 * Get senior status
 */
async function getSeniorStatus(seniorId: string, language: Language): Promise<string> {
  try {
    const supabase = getServiceRoleClient();
    
    // Get senior info
    const { data: senior } = await supabase
      .from('seniors')
      .select('scam_shield_enabled')
      .eq('id', seniorId)
      .single();

    // Get recent activity
    const { data: recentSessions } = await supabase
      .from('sessions')
      .select('session_type')
      .eq('senior_id', seniorId)
      .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    const callCount = recentSessions?.filter(s => s.session_type === 'ivr').length || 0;
    const webCount = recentSessions?.filter(s => s.session_type === 'web').length || 0;

    const scamStatus = senior?.scam_shield_enabled
      ? t(language, 'scam_shield.status_active')
      : t(language, 'scam_shield.status_inactive');

    return `${scamStatus}\n\nLast 7 days:\n📞 ${callCount} calls\n💻 ${webCount} web sessions`;
  } catch (error) {
    console.error('Error getting senior status:', error);
    return t(language, 'errors.technical');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


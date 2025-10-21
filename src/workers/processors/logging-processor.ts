// Async logging processor
import { getServiceRoleClient } from '../../lib/supabase/client';

interface LoggingJobData {
  type: 'conversation' | 'task' | 'scam' | 'session' | 'sms';
  data: any;
}

/**
 * Process async logging job
 * Logs events to database without blocking main request flow
 */
export async function processLoggingJob(data: LoggingJobData): Promise<{ success: boolean }> {
  try {
    const { type, data: logData } = data;

    console.log(`Logging ${type} event`);

    const supabase = getServiceRoleClient();

    switch (type) {
      case 'conversation':
        await logConversation(supabase, logData);
        break;
      case 'task':
        await logTask(supabase, logData);
        break;
      case 'scam':
        await logScam(supabase, logData);
        break;
      case 'session':
        await logSession(supabase, logData);
        break;
      case 'sms':
        await logSMS(supabase, logData);
        break;
      default:
        console.warn(`Unknown log type: ${type}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error processing logging job:', error);
    return { success: false };
  }
}

/**
 * Log conversation message
 */
async function logConversation(supabase: any, data: any) {
  await supabase.from('conversations').insert({
    session_id: data.sessionId,
    senior_id: data.seniorId,
    message_type: data.messageType,
    content: data.content,
    language: data.language,
    detected_intent: data.detectedIntent,
  });
}

/**
 * Log task execution
 */
async function logTask(supabase: any, data: any) {
  if (data.action === 'create') {
    await supabase.from('tasks').insert({
      session_id: data.sessionId,
      senior_id: data.seniorId,
      task_type: data.taskType,
      task_status: 'started',
      language: data.language,
      total_steps: data.totalSteps,
    });
  } else if (data.action === 'update') {
    await supabase
      .from('tasks')
      .update({
        task_status: data.status,
        steps_completed: data.stepsCompleted,
        completed_at: data.completedAt,
        duration_seconds: data.durationSeconds,
      })
      .eq('id', data.taskId);
  }
}

/**
 * Log scam event
 */
async function logScam(supabase: any, data: any) {
  await supabase.from('scam_logs').insert({
    senior_id: data.seniorId,
    phone_number: data.phoneNumber,
    caller_name: data.callerName,
    scam_risk_level: data.riskLevel,
    scam_type: data.scamType,
    blocked: data.blocked,
    source: data.source,
    details: data.details,
  });
}

/**
 * Log session
 */
async function logSession(supabase: any, data: any) {
  if (data.action === 'start') {
    await supabase.from('sessions').insert({
      senior_id: data.seniorId,
      session_type: data.sessionType,
      language: data.language,
      language_detected_method: data.languageDetectionMethod,
      phone_number: data.phoneNumber,
      call_sid: data.callSid,
      started_at: data.startedAt,
    });
  } else if (data.action === 'end') {
    await supabase
      .from('sessions')
      .update({
        ended_at: data.endedAt,
        duration_seconds: data.durationSeconds,
      })
      .eq('call_sid', data.callSid);
  }
}

/**
 * Log SMS message
 */
async function logSMS(supabase: any, data: any) {
  await supabase.from('sms_messages').insert({
    senior_id: data.seniorId,
    direction: data.direction,
    from_number: data.fromNumber,
    to_number: data.toNumber,
    message_body: data.messageBody,
    language: data.language,
    message_sid: data.messageSid,
    status: data.status,
  });
}

export default {
  processLoggingJob,
};


// Main conversation orchestrator - decides what to do based on user input
import { Language, t } from '../i18n';
import { detectTask, answerQuestion } from '../ai/openai';
import { checkContentSafety } from '../ai/safety';
import { getSession, updateSession, addMessage } from './session-manager';
import { processZoomInput } from '../tasks/zoom';
import { processPhoneInput } from '../tasks/phone';
import { processVolumeInput } from '../tasks/volume';
import { processWiFiInput } from '../tasks/wifi';
import { processScamCheckInput } from '../tasks/scam-check';
import { processSyncMeInstall } from '../tasks/syncme-install';

export interface OrchestratorResponse {
  message: string;
  action?: 'continue' | 'complete' | 'error';
  shouldEnd?: boolean;
}

/**
 * Main orchestrator - handles all user input and decides next action
 */
export async function orchestrate(
  callSid: string,
  userInput: string,
  language: Language,
  conversationHistory: any[] = []
): Promise<OrchestratorResponse> {
  try {
    const session = await getSession(callSid, '');
    
    // Add user message to history
    await addMessage(callSid, 'user', userInput);

    // Check content safety
    const safetyCheck = await checkContentSafety(userInput, 'user_input');
    if (!safetyCheck.isSafe && safetyCheck.riskLevel === 'high') {
      const response = t(language, 'errors.not_understand') + ' ' + t(language, 'common.help');
      await addMessage(callSid, 'assistant', response);
      return { message: response, action: 'continue' };
    }

    // If currently in a task, continue that task
    if (session.currentTaskType && session.currentTaskStep) {
      const taskResponse = await processCurrentTask(
        session.currentTaskType,
        userInput,
        session.currentTaskStep,
        session.taskState || {},
        language,
        session.seniorId
      );

      // Update session with new state
      await updateSession(callSid, {
        currentTaskStep: taskResponse.nextStep,
        taskState: taskResponse.state,
      });

      await addMessage(callSid, 'assistant', taskResponse.message);

      // Check if task is complete
      const isComplete = isTaskComplete(session.currentTaskType, taskResponse.nextStep);
      if (isComplete) {
        await updateSession(callSid, {
          currentTaskType: undefined,
          currentTaskStep: undefined,
          taskState: undefined,
        });

        const followUp = t(language, 'common.main_menu');
        return {
          message: taskResponse.message + ' ' + followUp,
          action: 'complete',
        };
      }

      return { message: taskResponse.message, action: 'continue' };
    }

    // No active task - detect what user wants
    // Combine session history + passed history for full context
    const fullHistory = [
      ...session.conversationHistory.slice(-3),
      ...conversationHistory.slice(-2),
    ].filter(Boolean);

    const taskDetection = await detectTask(
      userInput,
      language,
      fullHistory
    );

    // If general Q&A
    if (taskDetection.taskType === 'general_qa' || !taskDetection.taskType) {
      const answer = await answerQuestion(
        userInput,
        language,
        fullHistory
      );

      await addMessage(callSid, 'assistant', answer.answer);

      const followUp = answer.needsFollowUp
        ? t(language, 'tasks.general_qa.follow_up')
        : t(language, 'tasks.general_qa.anything_else');

      return {
        message: answer.answer + ' ' + followUp,
        action: 'continue',
      };
    }

    // Start a new guided task
    const taskStartMessage = await startTask(
      taskDetection.taskType,
      language,
      taskDetection.extractedData
    );

    await updateSession(callSid, {
      currentTaskType: taskDetection.taskType,
      currentTaskStep: 1,
      taskState: taskDetection.extractedData || {},
    });

    await addMessage(callSid, 'assistant', taskStartMessage);

    return { message: taskStartMessage, action: 'continue' };
  } catch (error) {
    console.error('Error in orchestrator:', error);
    // Propagate the error so the API layer can include details for the UI
    throw error;
  }
}

/**
 * Process current active task
 */
async function processCurrentTask(
  taskType: string,
  userInput: string,
  currentStep: number,
  state: any,
  language: Language,
  seniorId: string
): Promise<{ nextStep: number; state: any; message: string }> {
  switch (taskType) {
    case 'zoom_join':
      return await processZoomInput(userInput, currentStep, state, language);
    
    case 'phone_call':
    case 'contact_family':
      return await processPhoneInput(userInput, currentStep, state, language, seniorId);
    
    case 'volume_adjust':
      return await processVolumeInput(userInput, currentStep, state, language);
    
    case 'wifi_connect':
      return await processWiFiInput(userInput, currentStep, state, language);
    
    case 'scam_check':
      return await processScamCheckInput(userInput, currentStep, state, language, seniorId);
    
    case 'sync_me_install':
      return await processSyncMeInstall(userInput, currentStep, state, language, seniorId);
    
    default:
      return {
        nextStep: currentStep,
        state,
        message: t(language, 'errors.technical'),
      };
  }
}

/**
 * Start a new guided task
 */
async function startTask(
  taskType: string,
  language: Language,
  extractedData?: any
): Promise<string> {
  const taskMessages: Record<string, string> = {
    zoom_join: t(language, 'tasks.zoom_join.start'),
    phone_call: t(language, 'tasks.phone_call.start'),
    volume_adjust: t(language, 'tasks.volume_adjust.start'),
    wifi_connect: t(language, 'tasks.wifi_connect.start'),
    scam_check: t(language, 'tasks.scam_check.start'),
    sync_me_install: t(language, 'tasks.sync_me_install.intro'),
    contact_family: t(language, 'tasks.contact_family.start'),
  };

  const message = taskMessages[taskType] || t(language, 'common.understood');
  const prefix = t(language, 'common.dont_worry');

  return `${prefix} ${message}`;
}

/**
 * Check if task is complete based on step number
 */
function isTaskComplete(taskType: string, stepNumber: number): boolean {
  const taskStepCounts: Record<string, number> = {
    zoom_join: 9,
    phone_call: 4,
    volume_adjust: 4,
    wifi_connect: 4,
    scam_check: 4,
    sync_me_install: 3,
    contact_family: 4,
  };

  return stepNumber >= (taskStepCounts[taskType] || 5);
}

export default {
  orchestrate,
};


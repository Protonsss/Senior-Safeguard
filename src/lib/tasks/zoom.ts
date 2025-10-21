// Zoom joining guided task module
import { Language, t } from '../i18n';
import { extractZoomInfo } from '../ai/openai';

export interface ZoomTaskState {
  step: number;
  meetingId?: string;
  password?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export interface TaskStep {
  stepNumber: number;
  message: string;
  expectedInput?: string[];
  nextStep: (input: string) => Promise<{ nextStepNumber: number; data?: any }>;
}

/**
 * Get the current step instructions for Zoom joining
 */
export async function getZoomStep(
  stepNumber: number,
  language: Language,
  state: ZoomTaskState
): Promise<string> {
  const steps: Record<number, string> = {
    1: t(language, 'tasks.zoom_join.get_id'),
    2: t(language, 'tasks.zoom_join.confirm_id', { meetingId: state.meetingId || '' }),
    3: t(language, 'tasks.zoom_join.opening_app'),
    4: t(language, 'tasks.zoom_join.entering_id'),
    5: t(language, 'tasks.zoom_join.joining'),
    6: t(language, 'tasks.zoom_join.success'),
    7: t(language, 'tasks.zoom_join.need_audio'),
    8: t(language, 'tasks.zoom_join.need_video'),
    9: t(language, 'tasks.zoom_join.complete'),
  };

  return steps[stepNumber] || t(language, 'errors.technical');
}

/**
 * Process user input for Zoom task
 */
export async function processZoomInput(
  input: string,
  currentStep: number,
  state: ZoomTaskState,
  language: Language
): Promise<{ nextStep: number; state: ZoomTaskState; message: string }> {
  switch (currentStep) {
    case 1: {
      // Getting meeting ID
      const zoomInfo = await extractZoomInfo(input);
      if (zoomInfo?.meetingId) {
        const newState = { ...state, meetingId: zoomInfo.meetingId, password: zoomInfo.password };
        return {
          nextStep: 2,
          state: newState,
          message: t(language, 'tasks.zoom_join.confirm_id', { meetingId: zoomInfo.meetingId }),
        };
      } else {
        return {
          nextStep: 1,
          state,
          message: t(language, 'errors.not_understand') + ' ' + t(language, 'tasks.zoom_join.get_id'),
        };
      }
    }

    case 2: {
      // Confirming meeting ID
      const isYes = /yes|yeah|correct|right|yep|yup|uh huh|确认|对|是|हां|सही|ஆம்|சரி/i.test(input);
      if (isYes) {
        return {
          nextStep: 3,
          state,
          message: t(language, 'tasks.zoom_join.opening_app'),
        };
      } else {
        return {
          nextStep: 1,
          state: { ...state, meetingId: undefined },
          message: t(language, 'tasks.zoom_join.get_id'),
        };
      }
    }

    case 3:
    case 4:
    case 5:
      // Auto-advancing steps (system is doing the work)
      return {
        nextStep: currentStep + 1,
        state,
        message: await getZoomStep(currentStep + 1, language, state),
      };

    case 6: {
      // Check if they see others
      const canSee = /yes|yeah|see|看到|देख|பார்க்கிறேன்/i.test(input);
      if (canSee) {
        return {
          nextStep: 7,
          state,
          message: t(language, 'tasks.zoom_join.need_audio'),
        };
      } else {
        return {
          nextStep: 6,
          state,
          message: t(language, 'common.one_moment') + ' ' + t(language, 'tasks.zoom_join.success'),
        };
      }
    }

    case 7: {
      // Audio setup
      const wantsAudio = /yes|yeah|please|help|是|要|हां|ஆம்/i.test(input);
      return {
        nextStep: wantsAudio ? 8 : 9,
        state: { ...state, audioEnabled: wantsAudio },
        message: wantsAudio ? t(language, 'tasks.zoom_join.need_video') : t(language, 'tasks.zoom_join.complete'),
      };
    }

    case 8: {
      // Video setup
      const wantsVideo = /yes|yeah|please|help|是|要|हां|ஆம்/i.test(input);
      return {
        nextStep: 9,
        state: { ...state, videoEnabled: wantsVideo },
        message: t(language, 'tasks.zoom_join.complete'),
      };
    }

    default:
      return {
        nextStep: currentStep,
        state,
        message: t(language, 'errors.technical'),
      };
  }
}

export default {
  getZoomStep,
  processZoomInput,
};


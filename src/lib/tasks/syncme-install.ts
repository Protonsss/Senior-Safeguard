// Sync.me Scam Shield guided task module
import { Language, t } from '../i18n';
import { installScamShield, checkInstallStatus } from '../scam/syncme';

export interface SyncMeTaskState {
  step: number;
  installing?: boolean;
  installed?: boolean;
  activatedAt?: string;
}

export async function processSyncMeInstall(
  input: string,
  currentStep: number,
  state: SyncMeTaskState,
  language: Language,
  seniorId: string,
  phoneNumber?: string
): Promise<{ nextStep: number; state: SyncMeTaskState; message: string }> {
  switch (currentStep) {
    case 1: {
      // Ask for permission in intro already handled by startTask
      const consent = /^(yes|ok|okay|sure|please|是|好|可以|हां|ठीक|ஆம்|சரி)\b/i.test(input);
      const decline = /^(no|not now|later|maybe later|不要|不用|否|नहीं|இல்லை)\b/i.test(input);
      
      if (consent) {
        return {
          nextStep: 2,
          state: { ...state, installing: true },
          message: t(language, 'tasks.sync_me_install.installing'),
        };
      }
      
      if (decline) {
        // User explicitly declined - complete task without installing
        return {
          nextStep: 4,
          state: { ...state, installed: false },
          message: t(language, 'common.understood'),
        };
      }
      
      // Didn't understand - ask again
      return {
        nextStep: 1,
        state,
        message: t(language, 'errors.not_understand'),
      };
    }

    case 2: {
      // Perform installation (mocked)
      const result = await installScamShield(seniorId, phoneNumber || '');
      if (result.installed) {
        return {
          nextStep: 3,
          state: { ...state, installing: false, installed: true, activatedAt: result.activatedAt?.toISOString() },
          message: t(language, 'tasks.sync_me_install.success'),
        };
      } else {
        return {
          nextStep: 1,
          state: { ...state, installing: false, installed: false },
          message: t(language, 'tasks.sync_me_install.failed'),
        };
      }
    }

    case 3: {
      // Confirm status and complete
      const status = await checkInstallStatus(seniorId);
      if (status.installed) {
        return {
          nextStep: 4, // Advance to complete the task
          state: { ...state, installed: true },
          message: t(language, 'tasks.sync_me_install.success'),
        };
      }
      return {
        nextStep: 1,
        state: { ...state, installed: false },
        message: t(language, 'tasks.sync_me_install.failed'),
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
  processSyncMeInstall,
};



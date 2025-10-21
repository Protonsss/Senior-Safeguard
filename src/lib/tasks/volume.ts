// Volume adjustment guided task module
import { Language, t } from '../i18n';

export interface VolumeTaskState {
  step: number;
  currentLevel: number;
  targetLevel?: number;
}

/**
 * Parse volume level from user input
 */
export function parseVolumeLevel(input: string): number | null {
  // Check for explicit numbers
  const numberMatch = input.match(/\b(\d{1,2})\b/);
  if (numberMatch) {
    const level = parseInt(numberMatch[1]);
    if (level >= 0 && level <= 10) return level;
  }

  // Check for relative commands
  if (/loud|up|high|increase|more|大声|बड़ा|அதிகம்/i.test(input)) {
    return -1; // Signal to increase
  }
  if (/quiet|down|low|decrease|less|soft|小声|कम|குறைவு/i.test(input)) {
    return -2; // Signal to decrease
  }
  if (/mute|silent|off|静音|मौन|முடக்கு/i.test(input)) {
    return 0;
  }
  if (/max|maximum|full|最大|अधिकतम|முழு/i.test(input)) {
    return 10;
  }

  return null;
}

/**
 * Process user input for volume task
 */
export async function processVolumeInput(
  input: string,
  currentStep: number,
  state: VolumeTaskState,
  language: Language
): Promise<{ nextStep: number; state: VolumeTaskState; message: string }> {
  switch (currentStep) {
    case 1: {
      // Getting desired volume level
      const level = parseVolumeLevel(input);
      
      if (level === null) {
        return {
          nextStep: 1,
          state,
          message: t(language, 'errors.not_understand') + ' ' + t(language, 'tasks.volume_adjust.start'),
        };
      }

      let targetLevel = level;
      if (level === -1) {
        // Increase by 2
        targetLevel = Math.min(10, state.currentLevel + 2);
      } else if (level === -2) {
        // Decrease by 2
        targetLevel = Math.max(0, state.currentLevel - 2);
      }

      return {
        nextStep: 2,
        state: { ...state, targetLevel },
        message: t(language, 'tasks.volume_adjust.adjusting'),
      };
    }

    case 2: {
      // Adjusting volume (simulate)
      return {
        nextStep: 3,
        state,
        message: t(language, 'tasks.volume_adjust.confirm'),
      };
    }

    case 3: {
      // Confirm if volume is good
      const isGood = /yes|good|fine|ok|right|better|perfect|好|是|ठीक|सही|நல்ல|சரி/i.test(input);
      
      if (isGood) {
        return {
          nextStep: 4,
          state: { ...state, currentLevel: state.targetLevel || state.currentLevel },
          message: t(language, 'tasks.volume_adjust.complete', { 
            level: state.targetLevel?.toString() || '5' 
          }),
        };
      } else {
        return {
          nextStep: 1,
          state: { ...state, currentLevel: state.targetLevel || state.currentLevel },
          message: t(language, 'tasks.volume_adjust.start'),
        };
      }
    }

    default:
      return {
        nextStep: currentStep,
        state,
        message: t(language, 'errors.technical'),
      };
  }
}

/**
 * Get current device volume (mock implementation)
 */
export async function getCurrentVolume(): Promise<number> {
  // In production, this would query device settings
  return 5;
}

/**
 * Set device volume (mock implementation)
 */
export async function setDeviceVolume(level: number): Promise<boolean> {
  // In production, this would set device volume
  console.log(`Setting volume to ${level}`);
  return true;
}

export default {
  parseVolumeLevel,
  processVolumeInput,
  getCurrentVolume,
  setDeviceVolume,
};


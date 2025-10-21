// Scam check guided task module
import { Language, t } from '../i18n';
import { extractPhoneNumber } from '../ai/openai';
import { checkPhoneNumber, blockPhoneNumber, ScamCheckResult } from '../scam/syncme';
import { getServiceRoleClient } from '../supabase/client';

export interface ScamCheckTaskState {
  step: number;
  phoneNumber?: string;
  checkResult?: ScamCheckResult;
  blocked?: boolean;
}

/**
 * Process user input for scam check task
 */
export async function processScamCheckInput(
  input: string,
  currentStep: number,
  state: ScamCheckTaskState,
  language: Language,
  seniorId: string
): Promise<{ nextStep: number; state: ScamCheckTaskState; message: string }> {
  switch (currentStep) {
    case 1: {
      // Getting phone number to check
      const phoneNumber = await extractPhoneNumber(input);
      
      if (phoneNumber) {
        return {
          nextStep: 2,
          state: { ...state, phoneNumber },
          message: t(language, 'tasks.scam_check.checking'),
        };
      } else {
        return {
          nextStep: 1,
          state,
          message: t(language, 'errors.not_understand') + ' ' + t(language, 'tasks.scam_check.start'),
        };
      }
    }

    case 2: {
      // Checking the number
      if (!state.phoneNumber) {
        return {
          nextStep: 1,
          state,
          message: t(language, 'tasks.scam_check.start'),
        };
      }

      const checkResult = await checkPhoneNumber(state.phoneNumber);
      
      // Log to database
      await logScamCheck(seniorId, checkResult);

      let message: string;
      if (checkResult.isScam) {
        if (checkResult.riskLevel === 'critical' || checkResult.riskLevel === 'high') {
          message = t(language, 'tasks.scam_check.warning', { 
            reports: checkResult.reportCount.toString() 
          });
        } else {
          message = t(language, 'tasks.scam_check.warning', { 
            reports: checkResult.reportCount.toString() 
          });
        }
      } else {
        if (checkResult.reportCount > 0) {
          message = t(language, 'tasks.scam_check.safe', { 
            reports: checkResult.reportCount.toString() 
          });
        } else {
          message = t(language, 'tasks.scam_check.no_data');
        }
      }

      // If high risk, ask if they want to block
      const nextStep = (checkResult.riskLevel === 'high' || checkResult.riskLevel === 'critical') ? 3 : 4;

      return {
        nextStep,
        state: { ...state, checkResult },
        message,
      };
    }

    case 3: {
      // Ask if they want to block
      const wantsToBlock = /yes|block|stop|是|屏蔽|हां|ब्लॉक|ஆம்|தடு/i.test(input);
      
      if (wantsToBlock && state.phoneNumber) {
        const blocked = await blockPhoneNumber(seniorId, state.phoneNumber);
        return {
          nextStep: 4,
          state: { ...state, blocked },
          message: t(language, 'tasks.scam_check.blocked'),
        };
      } else {
        return {
          nextStep: 4,
          state,
          message: t(language, 'common.understood'),
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
 * Log scam check to database
 */
async function logScamCheck(seniorId: string, result: ScamCheckResult): Promise<void> {
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

export default {
  processScamCheckInput,
};


// Phone call guided task module
import { Language, t } from '../i18n';
import { extractPhoneNumber } from '../ai/openai';
import { getServiceRoleClient } from '../supabase/client';

export interface PhoneTaskState {
  step: number;
  phoneNumber?: string;
  contactName?: string;
  callSid?: string;
}

/**
 * Get trusted contacts for a senior
 */
export async function getTrustedContacts(seniorId: string): Promise<Array<{ name: string; phone: string }>> {
  try {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('contact_name, phone_number')
      .eq('senior_id', seniorId)
      .order('priority', { ascending: true })
      .limit(5);

    if (error) throw error;

    return data.map(c => ({ name: c.contact_name, phone: c.phone_number }));
  } catch (error) {
    console.error('Error getting trusted contacts:', error);
    return [];
  }
}

/**
 * Process user input for phone call task
 */
export async function processPhoneInput(
  input: string,
  currentStep: number,
  state: PhoneTaskState,
  language: Language,
  seniorId: string
): Promise<{ nextStep: number; state: PhoneTaskState; message: string }> {
  switch (currentStep) {
    case 1: {
      // Getting phone number or contact name
      
      // First, check if they mentioned a contact name
      const contacts = await getTrustedContacts(seniorId);
      const matchedContact = contacts.find(c => 
        input.toLowerCase().includes(c.name.toLowerCase())
      );

      if (matchedContact) {
        const newState = { 
          ...state, 
          phoneNumber: matchedContact.phone, 
          contactName: matchedContact.name 
        };
        return {
          nextStep: 2,
          state: newState,
          message: t(language, 'tasks.phone_call.confirm_number', { 
            number: `${matchedContact.name} at ${matchedContact.phone}` 
          }),
        };
      }

      // Try to extract phone number
      const phoneNumber = await extractPhoneNumber(input);
      if (phoneNumber) {
        const newState = { ...state, phoneNumber };
        return {
          nextStep: 2,
          state: newState,
          message: t(language, 'tasks.phone_call.confirm_number', { number: phoneNumber }),
        };
      }

      // If nothing found, ask again
      return {
        nextStep: 1,
        state,
        message: t(language, 'errors.not_understand') + ' ' + t(language, 'tasks.phone_call.get_number'),
      };
    }

    case 2: {
      // Confirming phone number
      const isYes = /yes|yeah|correct|right|yep|yup|确认|对|是|हां|सही|ஆம்|சரி/i.test(input);
      if (isYes) {
        return {
          nextStep: 3,
          state,
          message: t(language, 'tasks.phone_call.calling'),
        };
      } else {
        return {
          nextStep: 1,
          state: { ...state, phoneNumber: undefined, contactName: undefined },
          message: t(language, 'tasks.phone_call.get_number'),
        };
      }
    }

    case 3: {
      // Calling - this would trigger actual Twilio call
      // For now, simulate success
      return {
        nextStep: 4,
        state: { ...state, callSid: 'CA' + Date.now() },
        message: t(language, 'tasks.phone_call.connected'),
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

/**
 * Initiate a phone call via Twilio
 */
export async function initiateCall(fromNumber: string, toNumber: string): Promise<string | null> {
  try {
    // In production, use Twilio SDK to initiate call
    // const twilio = require('twilio')(accountSid, authToken);
    // const call = await twilio.calls.create({
    //   from: fromNumber,
    //   to: toNumber,
    //   url: 'http://your-server.com/voice',
    // });
    // return call.sid;

    console.log(`Initiating call from ${fromNumber} to ${toNumber}`);
    return 'CA' + Date.now();
  } catch (error) {
    console.error('Error initiating call:', error);
    return null;
  }
}

export default {
  getTrustedContacts,
  processPhoneInput,
  initiateCall,
};


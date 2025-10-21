// AI Safety filters and content moderation
// NOTE: We intentionally avoid paid APIs here. Safety is done with simple patterns.

export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Check if user input or AI response is safe for seniors
 * Protects against:
 * - Scam attempts
 * - Requests for sensitive info (SSN, passwords, etc.)
 * - Harmful content
 * - Financial requests
 */
// Basic pattern-based safety check (fast, free)
function basicSafetyCheck(content: string): SafetyCheckResult {
  const lower = content.toLowerCase();

  const highRisk = [
    /social\s*security\s*number|\bssn\b/i,
    /credit\s*card|debit\s*card|card\s*number/i,
    /bank\s*account|routing\s*number/i,
    /password|pin\s*code/i,
    /wire\s*transfer|western\s*union|moneygram/i,
    /gift\s*card|itunes\s*card|google\s*play\s*card/i,
  ];
  for (const p of highRisk) if (p.test(lower)) {
    return { isSafe: false, reason: 'Sensitive information request', riskLevel: 'high' };
  }

  const mediumRisk = [
    /urgent|act\s*now|limited\s*time/i,
    /irs|tax|federal|government\s*agency/i,
    /verify\s*your\s*account|confirm\s*your\s*identity/i,
  ];
  for (const p of mediumRisk) if (p.test(lower)) {
    return { isSafe: true, reason: 'Potentially suspicious language', riskLevel: 'medium' };
  }

  return { isSafe: true, riskLevel: 'low' };
}

export async function checkContentSafety(content: string, _context: 'user_input' | 'ai_response'):
  Promise<SafetyCheckResult> {
  try {
    return basicSafetyCheck(content);
  } catch (error) {
    console.error('Error checking content safety:', error);
    return { isSafe: true, riskLevel: 'low' };
  }
}

/**
 * Detect if a phone number might be a scam based on patterns
 */
export function isLikelyScamPattern(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Common scam patterns
  const scamPatterns = [
    /^1?800/, // 800 numbers (not always scam but suspicious for seniors)
    /^1?888/,
    /^1?877/,
    /^(\d)\1{9}/, // Repeated digits (e.g., 1111111111)
    /^1234567890/, // Sequential
  ];

  return scamPatterns.some(pattern => pattern.test(cleaned));
}

/**
 * Generate a calm warning message for potential scams
 */
export function generateScamWarning(riskLevel: 'low' | 'medium' | 'high', language: string): string {
  const warnings: Record<string, Record<string, string>> = {
    en: {
      low: 'Please be careful. I don\'t have much information about this number.',
      medium: 'Warning: This number has been reported by some people. Be cautious.',
      high: 'STOP! This number has been reported many times as a scam. Do not give them any information. Would you like me to block it?',
    },
    zh: {
      low: '请小心。我对这个号码了解不多。',
      medium: '警告：有些人举报过这个号码。请谨慎。',
      high: '停！这个号码多次被举报为诈骗。不要给他们任何信息。要我屏蔽它吗？',
    },
    hi: {
      low: 'कृपया सावधान रहें। मेरे पास इस नंबर के बारे में ज्यादा जानकारी नहीं है।',
      medium: 'चेतावनी: कुछ लोगों ने इस नंबर की रिपोर्ट की है। सावधान रहें।',
      high: 'रुकें! इस नंबर को कई बार घोटाले के रूप में रिपोर्ट किया गया है। उन्हें कोई जानकारी न दें। क्या मैं इसे ब्लॉक कर दूं?',
    },
    ta: {
      low: 'தயவுசெய்து கவனமாக இருங்கள். இந்த எண்ணைப் பற்றி என்னிடம் அதிக தகவல் இல்லை.',
      medium: 'எச்சரிக்கை: சிலர் இந்த எண்ணை புகாரளித்துள்ளனர். கவனமாக இருங்கள்.',
      high: 'நிறுத்து! இந்த எண் பலமுறை மோசடி என புகாரளிக்கப்பட்டுள்ளது. அவர்களுக்கு எந்த தகவலையும் கொடுக்காதீர்கள். நான் அதைத் தடுக்கட்டுமா?',
    },
  };

  return warnings[language]?.[riskLevel] || warnings.en[riskLevel];
}

export default {
  checkContentSafety,
  isLikelyScamPattern,
  generateScamWarning,
};


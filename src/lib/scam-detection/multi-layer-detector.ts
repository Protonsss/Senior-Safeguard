/**
 * SENIOR SAFEGUARD - MULTI-LAYER SCAM DETECTION SYSTEM
 *
 * Implements a sophisticated 4-layer defense system:
 * 1. URL Analysis (PhishTank + Google Safe Browsing)
 * 2. Visual Analysis (Gemini Vision)
 * 3. Behavioral Analysis (Mouse tracking, hesitation detection)
 * 4. Contextual AI (GPT/Gemini for holistic understanding)
 *
 * Architecture follows defense-in-depth security principles.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ScamDetectionResult {
  isScam: boolean;
  confidence: number; // 0.0 - 1.0
  threatLevel: number; // 0-100
  scamType: ScamType | null;
  reasoning: string;
  layers: {
    url: URLAnalysisResult;
    visual: VisualAnalysisResult;
    behavioral: BehavioralAnalysisResult;
    contextual: ContextualAnalysisResult;
  };
  shouldBlock: boolean;
  estimatedLossPrevented: number; // USD
}

export type ScamType =
  | 'phishing'
  | 'tech_support'
  | 'gift_card'
  | 'romance'
  | 'lottery'
  | 'irs'
  | 'fake_invoice'
  | 'cryptocurrency'
  | 'fake_charity';

interface URLAnalysisResult {
  score: number; // 0-100
  isKnownThreat: boolean;
  threatSource: 'phishtank' | 'google_safe_browsing' | 'manual' | 'none';
  domain: string;
  domainAge: number | null; // days
  isSSL: boolean;
  homographDetected: boolean;
  typosquattingDetected: boolean;
}

interface VisualAnalysisResult {
  score: number; // 0-100
  indicators: VisualIndicator[];
  hasUrgencyLanguage: boolean;
  hasFakeLogo: boolean;
  hasCountdownTimer: boolean;
  grammarErrors: number;
  suspiciousElements: string[];
}

interface VisualIndicator {
  type: 'urgency' | 'fake_logo' | 'poor_grammar' | 'suspicious_form' | 'fake_popup';
  confidence: number;
  location: string;
}

interface BehavioralAnalysisResult {
  score: number; // 0-100
  hesitationSeconds: number;
  mousePattern: 'confident' | 'hesitant' | 'erratic' | 'confused';
  isFirstVisit: boolean;
  isUnusualTime: boolean;
  rapidClicks: boolean;
}

interface ContextualAnalysisResult {
  score: number; // 0-100
  aiAnalysis: string;
  confidence: number;
  relevantContext: string[];
}

interface DetectionContext {
  url: string;
  screenshot?: string; // Base64 encoded
  userBehavior?: {
    mouseMovements: number;
    timeOnPage: number;
    clicks: number;
  };
  userHistory?: {
    firstVisit: boolean;
    previousVisits: number;
  };
  timestamp: Date;
}

// ============================================================================
// LAYER 1: URL ANALYSIS
// ============================================================================

class URLAnalyzer {
  private phishTankCache: Map<string, boolean> = new Map();
  private googleSafeBrowsingCache: Map<string, boolean> = new Map();

  async analyze(url: string): Promise<URLAnalysisResult> {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Parallel checks for speed
    const [
      isPhishTankThreat,
      isGoogleThreat,
      domainAge,
      homographDetected,
      typosquattingDetected
    ] = await Promise.all([
      this.checkPhishTank(url),
      this.checkGoogleSafeBrowsing(url),
      this.checkDomainAge(domain),
      this.detectHomograph(domain),
      this.detectTyposquatting(domain)
    ]);

    const isKnownThreat = isPhishTankThreat || isGoogleThreat;
    const isSSL = urlObj.protocol === 'https:';

    // Calculate score (0-100, higher = more suspicious)
    let score = 0;
    if (isKnownThreat) score += 90;
    if (!isSSL) score += 30;
    if (homographDetected) score += 40;
    if (typosquattingDetected) score += 35;
    if (domainAge !== null && domainAge < 30) score += 25; // New domains suspicious
    score = Math.min(100, score);

    return {
      score,
      isKnownThreat,
      threatSource: isPhishTankThreat ? 'phishtank' : isGoogleThreat ? 'google_safe_browsing' : 'none',
      domain,
      domainAge,
      isSSL,
      homographDetected,
      typosquattingDetected
    };
  }

  private async checkPhishTank(url: string): Promise<boolean> {
    // Check cache first
    if (this.phishTankCache.has(url)) {
      return this.phishTankCache.get(url)!;
    }

    try {
      const apiKey = process.env.PHISHTANK_API_KEY;
      if (!apiKey) {
        console.warn('PhishTank API key not configured');
        return false;
      }

      // PhishTank API call
      const response = await fetch('https://checkurl.phishtank.com/checkurl/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Senior-Safeguard/1.0'
        },
        body: new URLSearchParams({
          url: url,
          format: 'json',
          app_key: apiKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        const isPhishing = data.results?.in_database && data.results?.valid;

        // Cache result for 1 hour
        this.phishTankCache.set(url, isPhishing);
        setTimeout(() => this.phishTankCache.delete(url), 3600000);

        return isPhishing;
      }
    } catch (error) {
      console.error('PhishTank check failed:', error);
    }

    return false;
  }

  private async checkGoogleSafeBrowsing(url: string): Promise<boolean> {
    if (this.googleSafeBrowsingCache.has(url)) {
      return this.googleSafeBrowsingCache.get(url)!;
    }

    try {
      const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
      if (!apiKey) {
        console.warn('Google Safe Browsing API key not configured');
        return false;
      }

      const response = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: {
              clientId: 'senior-safeguard',
              clientVersion: '1.0.0'
            },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url }]
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const isThreat = data.matches && data.matches.length > 0;

        this.googleSafeBrowsingCache.set(url, isThreat);
        setTimeout(() => this.googleSafeBrowsingCache.delete(url), 3600000);

        return isThreat;
      }
    } catch (error) {
      console.error('Google Safe Browsing check failed:', error);
    }

    return false;
  }

  private async checkDomainAge(domain: string): Promise<number | null> {
    try {
      // WHOIS API to check domain registration date
      const apiKey = process.env.WHOIS_API_KEY;
      if (!apiKey) return null;

      const response = await fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`);

      if (response.ok) {
        const data = await response.json();
        const createdDate = data.WhoisRecord?.createdDate;
        if (createdDate) {
          const created = new Date(createdDate);
          const now = new Date();
          const ageInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return ageInDays;
        }
      }
    } catch (error) {
      console.error('Domain age check failed:', error);
    }

    return null;
  }

  private async detectHomograph(domain: string): Promise<boolean> {
    // Detect homograph attacks (e.g., paypa1.com vs paypal.com)
    const suspiciousChars = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i;
    const hasUnicodeChars = suspiciousChars.test(domain);

    // Check against common brand names
    const commonBrands = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook', 'bank', 'chase', 'wellsfargo'];
    const normalizedDomain = domain.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    for (const brand of commonBrands) {
      if (normalizedDomain.includes(brand) && normalizedDomain !== `${brand}.com`) {
        // Similar to brand but not exact match = suspicious
        const distance = this.levenshteinDistance(normalizedDomain, `${brand}.com`);
        if (distance <= 2) {
          return true;
        }
      }
    }

    return hasUnicodeChars;
  }

  private async detectTyposquatting(domain: string): Promise<boolean> {
    const commonBrands = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook'];
    const domainLower = domain.toLowerCase();

    for (const brand of commonBrands) {
      const distance = this.levenshteinDistance(domainLower, `${brand}.com`);
      if (distance > 0 && distance <= 2) {
        return true; // Very similar to legitimate brand = typosquatting
      }
    }

    return false;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

// ============================================================================
// LAYER 2: VISUAL ANALYSIS (Gemini Vision)
// ============================================================================

class VisualAnalyzer {
  private gemini: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    this.gemini = new GoogleGenerativeAI(apiKey || '');
  }

  async analyze(screenshot: string, url: string): Promise<VisualAnalysisResult> {
    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a senior citizen scam detection expert. Analyze this screenshot for scam indicators.

URL: ${url}

Look for:
1. Urgency language ("ACT NOW", "LIMITED TIME", countdown timers)
2. Fake logos or branding (poor quality, slightly off)
3. Grammar/spelling errors
4. Suspicious forms requesting sensitive info
5. Fake popups (virus warnings, prize notifications)
6. Pressure tactics (threats, fear language)
7. Too-good-to-be-true offers

Respond in JSON format:
{
  "isScam": true/false,
  "confidence": 0.0-1.0,
  "indicators": [
    {"type": "urgency|fake_logo|poor_grammar|suspicious_form|fake_popup", "confidence": 0.0-1.0, "location": "description"}
  ],
  "hasUrgencyLanguage": true/false,
  "hasFakeLogo": true/false,
  "hasCountdownTimer": true/false,
  "grammarErrors": number,
  "suspiciousElements": ["description of suspicious element"],
  "reasoning": "brief explanation"
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: screenshot,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const text = result.response.text();
      const analysis = this.parseGeminiResponse(text);

      // Calculate score
      let score = 0;
      if (analysis.hasUrgencyLanguage) score += 25;
      if (analysis.hasFakeLogo) score += 30;
      if (analysis.hasCountdownTimer) score += 20;
      score += Math.min(25, analysis.grammarErrors * 5);
      analysis.indicators.forEach(ind => {
        score += ind.confidence * 10;
      });
      score = Math.min(100, score);

      return { score, ...analysis };
    } catch (error) {
      console.error('Visual analysis failed:', error);

      // Fallback: Basic analysis
      return {
        score: 0,
        indicators: [],
        hasUrgencyLanguage: false,
        hasFakeLogo: false,
        hasCountdownTimer: false,
        grammarErrors: 0,
        suspiciousElements: []
      };
    }
  }

  private parseGeminiResponse(text: string): Omit<VisualAnalysisResult, 'score'> {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonText);
        return {
          indicators: parsed.indicators || [],
          hasUrgencyLanguage: parsed.hasUrgencyLanguage || false,
          hasFakeLogo: parsed.hasFakeLogo || false,
          hasCountdownTimer: parsed.hasCountdownTimer || false,
          grammarErrors: parsed.grammarErrors || 0,
          suspiciousElements: parsed.suspiciousElements || []
        };
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
    }

    return {
      indicators: [],
      hasUrgencyLanguage: false,
      hasFakeLogo: false,
      hasCountdownTimer: false,
      grammarErrors: 0,
      suspiciousElements: []
    };
  }
}

// ============================================================================
// LAYER 3: BEHAVIORAL ANALYSIS
// ============================================================================

class BehavioralAnalyzer {
  analyze(context: DetectionContext): BehavioralAnalysisResult {
    const behavior = context.userBehavior;
    const history = context.userHistory;
    const hour = context.timestamp.getHours();

    let score = 0;

    // Mouse pattern analysis
    let mousePattern: BehavioralAnalysisResult['mousePattern'] = 'confident';
    let hesitationSeconds = 0;

    if (behavior) {
      const timeOnPage = behavior.timeOnPage;
      const movementsPerSecond = behavior.mouseMovements / Math.max(1, timeOnPage);

      // Hesitation detection
      if (behavior.clicks === 0 && timeOnPage > 15) {
        hesitationSeconds = Math.floor(timeOnPage);
        score += Math.min(30, hesitationSeconds * 2);
      }

      // Mouse pattern classification
      if (movementsPerSecond < 0.5) {
        mousePattern = 'hesitant';
        score += 20;
      } else if (movementsPerSecond > 5) {
        mousePattern = 'erratic';
        score += 25;
      } else if (behavior.clicks > 10 && timeOnPage < 5) {
        mousePattern = 'confused';
        score += 30;
      }
    }

    // First visit to unfamiliar domain
    const isFirstVisit = history?.firstVisit ?? true;
    if (isFirstVisit) {
      score += 10; // New sites more risky
    }

    // Unusual time (late night/early morning)
    const isUnusualTime = hour < 6 || hour > 22;
    if (isUnusualTime) {
      score += 15; // Scammers often target off-hours
    }

    // Rapid clicks (panic/confusion)
    const rapidClicks = behavior ? behavior.clicks > 10 && behavior.timeOnPage < 10 : false;
    if (rapidClicks) {
      score += 20;
    }

    return {
      score: Math.min(100, score),
      hesitationSeconds,
      mousePattern,
      isFirstVisit,
      isUnusualTime,
      rapidClicks
    };
  }
}

// ============================================================================
// LAYER 4: CONTEXTUAL AI ANALYSIS
// ============================================================================

class ContextualAnalyzer {
  private gemini: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    this.gemini = new GoogleGenerativeAI(apiKey || '');
  }

  async analyze(context: DetectionContext, otherLayers: Partial<ScamDetectionResult['layers']>): Promise<ContextualAnalysisResult> {
    try {
      const model = this.gemini.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent, factual responses
          maxOutputTokens: 500
        }
      });

      const prompt = `You are protecting a senior citizen from online scams. Given all available context, determine if this is a scam attempt.

URL: ${context.url}

URL Analysis Results:
- Known threat database: ${otherLayers.url?.isKnownThreat ? 'FLAGGED AS THREAT' : 'Not in database'}
- SSL: ${otherLayers.url?.isSSL ? 'Yes' : 'No (RED FLAG)'}
- Domain age: ${otherLayers.url?.domainAge ? `${otherLayers.url.domainAge} days` : 'Unknown'}
- Homograph attack: ${otherLayers.url?.homographDetected ? 'DETECTED (RED FLAG)' : 'No'}

Visual Analysis Results:
${otherLayers.visual ? `
- Urgency language: ${otherLayers.visual.hasUrgencyLanguage ? 'YES (RED FLAG)' : 'No'}
- Fake logo: ${otherLayers.visual.hasFakeLogo ? 'YES (RED FLAG)' : 'No'}
- Grammar errors: ${otherLayers.visual.grammarErrors}
- Suspicious elements: ${otherLayers.visual.suspiciousElements.join(', ')}
` : 'Not available'}

User Behavior:
${otherLayers.behavioral ? `
- Hesitation time: ${otherLayers.behavioral.hesitationSeconds} seconds
- Mouse pattern: ${otherLayers.behavioral.mousePattern}
- First visit: ${otherLayers.behavioral.isFirstVisit ? 'Yes' : 'No'}
- Unusual time: ${otherLayers.behavioral.isUnusualTime ? 'Yes (late night/early morning)' : 'No'}
` : 'Not available'}

Respond in JSON:
{
  "isScam": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of your conclusion",
  "scamType": "phishing|tech_support|gift_card|romance|lottery|irs|fake_invoice|cryptocurrency|fake_charity|null",
  "relevantContext": ["key factors that influenced your decision"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const analysis = this.parseResponse(text);

      // Calculate score based on confidence
      const score = Math.round(analysis.confidence * 100);

      return {
        score,
        aiAnalysis: analysis.reasoning,
        confidence: analysis.confidence,
        relevantContext: analysis.relevantContext
      };
    } catch (error) {
      console.error('Contextual analysis failed:', error);

      return {
        score: 0,
        aiAnalysis: 'Analysis unavailable',
        confidence: 0,
        relevantContext: []
      };
    }
  }

  private parseResponse(text: string): {
    isScam: boolean;
    confidence: number;
    reasoning: string;
    relevantContext: string[];
  } {
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonText);
        return {
          isScam: parsed.isScam || false,
          confidence: parsed.confidence || 0,
          reasoning: parsed.reasoning || '',
          relevantContext: parsed.relevantContext || []
        };
      }
    } catch (error) {
      console.error('Failed to parse contextual response:', error);
    }

    return {
      isScam: false,
      confidence: 0,
      reasoning: 'Unable to analyze',
      relevantContext: []
    };
  }
}

// ============================================================================
// MAIN DETECTOR - ENSEMBLE DECISION
// ============================================================================

export class MultiLayerScamDetector {
  private urlAnalyzer = new URLAnalyzer();
  private visualAnalyzer = new VisualAnalyzer();
  private behavioralAnalyzer = new BehavioralAnalyzer();
  private contextualAnalyzer = new ContextualAnalyzer();

  // Weights for ensemble (must sum to 1.0)
  private weights = {
    url: 0.30,       // 30% - URL analysis is reliable
    visual: 0.25,    // 25% - Visual cues important
    behavioral: 0.15, // 15% - User behavior supplementary
    contextual: 0.30  // 30% - AI holistic understanding
  };

  async detect(context: DetectionContext): Promise<ScamDetectionResult> {
    console.log(`[Scam Detection] Starting multi-layer analysis for: ${context.url}`);

    // Layer 1: URL Analysis (fast, always runs)
    const urlResult = await this.urlAnalyzer.analyze(context.url);
    console.log(`[Layer 1] URL Analysis Score: ${urlResult.score}/100`);

    // Layer 2: Visual Analysis (if screenshot available)
    let visualResult: VisualAnalysisResult = {
      score: 0,
      indicators: [],
      hasUrgencyLanguage: false,
      hasFakeLogo: false,
      hasCountdownTimer: false,
      grammarErrors: 0,
      suspiciousElements: []
    };

    if (context.screenshot) {
      visualResult = await this.visualAnalyzer.analyze(context.screenshot, context.url);
      console.log(`[Layer 2] Visual Analysis Score: ${visualResult.score}/100`);
    }

    // Layer 3: Behavioral Analysis (if behavior data available)
    const behavioralResult = this.behavioralAnalyzer.analyze(context);
    console.log(`[Layer 3] Behavioral Analysis Score: ${behavioralResult.score}/100`);

    // Layer 4: Contextual AI Analysis (synthesizes all layers)
    const contextualResult = await this.contextualAnalyzer.analyze(context, {
      url: urlResult,
      visual: visualResult,
      behavioral: behavioralResult
    });
    console.log(`[Layer 4] Contextual AI Score: ${contextualResult.score}/100`);

    // Ensemble Decision: Weighted average
    const threatLevel = Math.round(
      urlResult.score * this.weights.url +
      visualResult.score * this.weights.visual +
      behavioralResult.score * this.weights.behavioral +
      contextualResult.score * this.weights.contextual
    );

    // Decision thresholds
    const isScam = threatLevel >= 70;
    const shouldBlock = threatLevel >= 60; // Lower threshold for blocking (be cautious)
    const confidence = threatLevel / 100;

    // Determine scam type
    const scamType = this.inferScamType(urlResult, visualResult);

    // Estimate financial loss prevented
    const estimatedLossPrevented = this.estimateLoss(scamType, threatLevel);

    // Generate human-readable reasoning
    const reasoning = this.generateReasoning(urlResult, visualResult, behavioralResult, contextualResult, threatLevel);

    console.log(`[Final Decision] Threat Level: ${threatLevel}/100, Block: ${shouldBlock}`);

    return {
      isScam,
      confidence,
      threatLevel,
      scamType,
      reasoning,
      layers: {
        url: urlResult,
        visual: visualResult,
        behavioral: behavioralResult,
        contextual: contextualResult
      },
      shouldBlock,
      estimatedLossPrevented
    };
  }

  private inferScamType(url: URLAnalysisResult, visual: VisualAnalysisResult): ScamType | null {
    const domain = url.domain.toLowerCase();

    // Domain-based detection
    if (domain.includes('tech-support') || domain.includes('microsoft-help')) return 'tech_support';
    if (domain.includes('irs') || domain.includes('tax')) return 'irs';
    if (domain.includes('crypto') || domain.includes('bitcoin')) return 'cryptocurrency';
    if (domain.includes('gift') || domain.includes('card')) return 'gift_card';
    if (domain.includes('lottery') || domain.includes('prize')) return 'lottery';
    if (domain.includes('dating') || domain.includes('romance')) return 'romance';
    if (domain.includes('paypal') || domain.includes('bank')) return 'phishing';

    // Visual-based detection
    if (visual.hasFakeLogo) return 'phishing';
    if (visual.hasUrgencyLanguage && visual.hasCountdownTimer) return 'lottery';

    return null;
  }

  private estimateLoss(scamType: ScamType | null, threatLevel: number): number {
    // Average losses by scam type (based on FBI IC3 2023 data)
    const averageLosses: Record<ScamType, number> = {
      phishing: 3000,
      tech_support: 7000,
      gift_card: 1500,
      romance: 15000,
      lottery: 5000,
      irs: 4000,
      fake_invoice: 10000,
      cryptocurrency: 25000,
      fake_charity: 2000
    };

    if (!scamType) return 0;

    // Scale by threat level (higher threat = more likely to succeed)
    return Math.round(averageLosses[scamType] * (threatLevel / 100));
  }

  private generateReasoning(
    url: URLAnalysisResult,
    visual: VisualAnalysisResult,
    behavioral: BehavioralAnalysisResult,
    contextual: ContextualAnalysisResult,
    threatLevel: number
  ): string {
    const reasons: string[] = [];

    // URL factors
    if (url.isKnownThreat) reasons.push('URL is in known threat database');
    if (!url.isSSL) reasons.push('Site uses insecure HTTP connection');
    if (url.homographDetected) reasons.push('URL contains look-alike characters (homograph attack)');
    if (url.typosquattingDetected) reasons.push('Domain mimics a legitimate brand');
    if (url.domainAge !== null && url.domainAge < 30) reasons.push(`Domain is only ${url.domainAge} days old`);

    // Visual factors
    if (visual.hasUrgencyLanguage) reasons.push('Page uses pressure tactics and urgency language');
    if (visual.hasFakeLogo) reasons.push('Page contains fake or low-quality brand logos');
    if (visual.grammarErrors > 2) reasons.push(`Page has ${visual.grammarErrors} grammar/spelling errors`);
    if (visual.hasCountdownTimer) reasons.push('Page uses countdown timer (common scam tactic)');

    // Behavioral factors
    if (behavioral.hesitationSeconds > 10) reasons.push(`You hesitated for ${behavioral.hesitationSeconds} seconds (sign of confusion)`);
    if (behavioral.mousePattern === 'erratic') reasons.push('Mouse movement patterns indicate uncertainty');
    if (behavioral.isUnusualTime) reasons.push('Activity at unusual hour (scammers target off-hours)');

    // AI insights
    if (contextual.aiAnalysis) reasons.push(contextual.aiAnalysis);

    if (reasons.length === 0) {
      return 'No significant threat indicators detected';
    }

    return reasons.join('. ') + '.';
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const scamDetector = new MultiLayerScamDetector();

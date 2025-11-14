/**
 * SCAM DETECTION API ENDPOINT
 * Real-time URL and screenshot analysis for scam prevention
 */

import { NextRequest, NextResponse } from 'next/server';
import { scamDetector } from '@/lib/scam-detection/multi-layer-detector';
import { createClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { url, screenshot, seniorId, sessionId, userBehavior, userHistory } = await req.json();

    // Validation
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`[Scam Detection API] Analyzing: ${url}`);

    // Run detection
    const result = await scamDetector.detect({
      url,
      screenshot,
      userBehavior,
      userHistory,
      timestamp: new Date()
    });

    console.log(`[Scam Detection API] Result: Threat Level ${result.threatLevel}/100, Block: ${result.shouldBlock}`);

    // Log to database
    if (seniorId) {
      try {
        const supabase = createClient();

        // Insert scam attempt record
        const { data: scamAttempt, error: scamError } = await supabase
          .from('scam_attempts')
          .insert({
            senior_id: seniorId,
            detected_at: new Date().toISOString(),
            scam_type: result.scamType || 'unknown',
            threat_level: result.threatLevel,
            url: url,
            domain: result.layers.url.domain,
            is_known_threat: result.layers.url.isKnownThreat,
            threat_source: result.layers.url.threatSource,
            screenshot_url: screenshot ? 'stored' : null,
            visual_indicators: result.layers.visual ? {
              urgency: result.layers.visual.hasUrgencyLanguage,
              fake_logo: result.layers.visual.hasFakeLogo,
              grammar_errors: result.layers.visual.grammarErrors,
              countdown_timer: result.layers.visual.hasCountdownTimer
            } : null,
            user_hesitation_seconds: result.layers.behavioral.hesitationSeconds,
            mouse_pattern: result.layers.behavioral.mousePattern,
            ai_analysis: result.reasoning,
            ai_confidence: result.confidence,
            was_blocked: result.shouldBlock,
            block_method: result.shouldBlock ? 'multi_layer_ai' : null,
            estimated_loss_prevented: result.shouldBlock ? result.estimatedLossPrevented : 0,
            session_id: sessionId || null
          })
          .select()
          .single();

        if (scamError) {
          console.error('Failed to log scam attempt:', scamError);
        }

        // If blocked, create alert for caregiver
        if (result.shouldBlock) {
          // Calculate priority using database function
          const { data: priorityData } = await supabase
            .rpc('calculate_alert_priority', {
              p_alert_type: 'scam_detected',
              p_severity: result.threatLevel >= 80 ? 'critical' : result.threatLevel >= 60 ? 'high' : 'medium',
              p_senior_id: seniorId,
              p_scam_threat_level: result.threatLevel
            });

          const priorityScore = priorityData || Math.round(result.threatLevel * 0.9);

          const { error: alertError } = await supabase
            .from('alerts')
            .insert({
              senior_id: seniorId,
              alert_type: 'scam_detected',
              severity: result.threatLevel >= 80 ? 'critical' : result.threatLevel >= 60 ? 'high' : 'medium',
              priority_score: priorityScore,
              title: `🚨 Scam Blocked: ${result.scamType || 'Suspicious Activity'}`,
              message: result.reasoning,
              context: {
                url,
                threat_level: result.threatLevel,
                scam_type: result.scamType,
                estimated_loss_prevented: result.estimatedLossPrevented
              },
              status: 'pending',
              scam_attempt_id: scamAttempt?.id,
              session_id: sessionId || null
            });

          if (alertError) {
            console.error('Failed to create alert:', alertError);
          }

          // TODO: Send real-time WebSocket notification to caregivers
          console.log(`[Alert Created] Priority: ${priorityScore}, Senior: ${seniorId}`);
        }

        // Log audit trail (HIPAA compliance)
        await supabase.from('audit_log').insert({
          actor_id: '00000000-0000-0000-0000-000000000000', // System ID
          actor_type: 'system',
          action: result.shouldBlock ? 'block_url' : 'scan_url',
          resource_type: 'scam_attempt',
          resource_id: scamAttempt?.id,
          details: {
            url,
            threat_level: result.threatLevel,
            blocked: result.shouldBlock
          },
          success: true
        });

      } catch (dbError) {
        console.error('Database logging failed:', dbError);
        // Don't fail the request if logging fails
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        isScam: result.isScam,
        shouldBlock: result.shouldBlock,
        threatLevel: result.threatLevel,
        confidence: result.confidence,
        scamType: result.scamType,
        reasoning: result.reasoning,
        estimatedLossPrevented: result.estimatedLossPrevented,
        layers: {
          url: {
            score: result.layers.url.score,
            isKnownThreat: result.layers.url.isKnownThreat,
            isSSL: result.layers.url.isSSL
          },
          visual: {
            score: result.layers.visual.score,
            hasUrgencyLanguage: result.layers.visual.hasUrgencyLanguage,
            hasFakeLogo: result.layers.visual.hasFakeLogo
          },
          behavioral: {
            score: result.layers.behavioral.score,
            mousePattern: result.layers.behavioral.mousePattern
          },
          contextual: {
            score: result.layers.contextual.score,
            confidence: result.layers.contextual.confidence
          }
        }
      }
    });

  } catch (error) {
    console.error('Scam detection failed:', error);

    return NextResponse.json(
      {
        error: 'Scam detection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'multi-layer-scam-detection',
    version: '1.0.0',
    layers: ['url', 'visual', 'behavioral', 'contextual'],
    timestamp: new Date().toISOString()
  });
}

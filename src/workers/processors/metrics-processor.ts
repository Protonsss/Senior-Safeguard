// Metrics aggregation processor
import { getServiceRoleClient } from '../../lib/supabase/client';

interface MetricsJobData {
  type: 'daily' | 'weekly' | 'monthly';
  seniorId?: string;
  date: string;
}

/**
 * Process metrics aggregation job
 * Aggregates daily/weekly/monthly metrics for caregiver dashboard
 */
export async function processMetricsJob(data: MetricsJobData): Promise<{ success: boolean }> {
  try {
    const { type, seniorId, date } = data;

    console.log(`Aggregating ${type} metrics for ${seniorId || 'all seniors'} on ${date}`);

    const supabase = getServiceRoleClient();

    if (type === 'daily') {
      await aggregateDailyMetrics(supabase, seniorId, date);
    } else if (type === 'weekly') {
      await aggregateWeeklyMetrics(supabase, seniorId, date);
    } else if (type === 'monthly') {
      await aggregateMonthlyMetrics(supabase, seniorId, date);
    }

    return { success: true };
  } catch (error) {
    console.error('Error processing metrics job:', error);
    return { success: false };
  }
}

/**
 * Aggregate daily metrics
 */
async function aggregateDailyMetrics(supabase: any, seniorId: string | undefined, date: string) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Query to aggregate metrics
  const query = supabase
    .from('sessions')
    .select('*')
    .gte('started_at', startOfDay.toISOString())
    .lte('started_at', endOfDay.toISOString());

  if (seniorId) {
    query.eq('senior_id', seniorId);
  }

  const { data: sessions, error } = await query;

  if (error) throw error;

  // Group by senior
  const metricsBySenior: Record<string, any> = {};

  for (const session of sessions || []) {
    if (!metricsBySenior[session.senior_id]) {
      metricsBySenior[session.senior_id] = {
        totalCalls: 0,
        totalSMS: 0,
        totalWebSessions: 0,
        totalDuration: 0,
      };
    }

    const metrics = metricsBySenior[session.senior_id];

    if (session.session_type === 'ivr') metrics.totalCalls++;
    if (session.session_type === 'sms') metrics.totalSMS++;
    if (session.session_type === 'web') metrics.totalWebSessions++;
    if (session.duration_seconds) metrics.totalDuration += session.duration_seconds;
  }

  // Get task completions
  for (const seniorIdKey of Object.keys(metricsBySenior)) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('senior_id', seniorIdKey)
      .eq('task_status', 'completed')
      .gte('started_at', startOfDay.toISOString())
      .lte('started_at', endOfDay.toISOString());

    metricsBySenior[seniorIdKey].tasksCompleted = tasks?.length || 0;

    // Get scam blocks
    const { data: scamLogs } = await supabase
      .from('scam_logs')
      .select('*')
      .eq('senior_id', seniorIdKey)
      .eq('blocked', true)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    metricsBySenior[seniorIdKey].scamCallsBlocked = scamLogs?.length || 0;
  }

  // Upsert metrics
  for (const [seniorIdKey, metrics] of Object.entries(metricsBySenior)) {
    await supabase
      .from('activity_metrics')
      .upsert({
        senior_id: seniorIdKey,
        metric_date: date,
        total_calls: metrics.totalCalls,
        total_sms: metrics.totalSMS,
        total_web_sessions: metrics.totalWebSessions,
        tasks_completed: metrics.tasksCompleted,
        scam_calls_blocked: metrics.scamCallsBlocked,
        avg_session_duration_seconds: Math.floor(
          metrics.totalDuration / (metrics.totalCalls + metrics.totalSMS + metrics.totalWebSessions || 1)
        ),
      }, {
        onConflict: 'senior_id,metric_date',
      });
  }

  console.log(`Aggregated daily metrics for ${Object.keys(metricsBySenior).length} seniors`);
}

/**
 * Aggregate weekly metrics (stub)
 */
async function aggregateWeeklyMetrics(supabase: any, seniorId: string | undefined, date: string) {
  // Similar to daily but for week range
  console.log('Weekly aggregation not yet implemented');
}

/**
 * Aggregate monthly metrics (stub)
 */
async function aggregateMonthlyMetrics(supabase: any, seniorId: string | undefined, date: string) {
  // Similar to daily but for month range
  console.log('Monthly aggregation not yet implemented');
}

export default {
  processMetricsJob,
};


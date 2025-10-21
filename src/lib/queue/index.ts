// Queue management utilities
import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Create Redis connection that supports both traditional Redis and Upstash REST API
function createRedisConnection() {
  // If using Upstash REST API (development mode without full Redis)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log('Using Upstash REST API connection');
    // For Upstash, we still need a Redis connection but will use REST in production
    // In development, this is optional - queues can be mocked or use Redis Cloud
    return new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      retryStrategy: () => {
        console.warn('Redis connection failed, but Upstash REST API is available');
        return null;
      },
    });
  }

  // Standard Redis connection
  return new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });
}

const connection = createRedisConnection();

// Initialize queues
export const ttsQueue = new Queue('tts-generation', { connection });
export const loggingQueue = new Queue('async-logging', { connection });
export const metricsQueue = new Queue('metrics-aggregation', { connection });

/**
 * Queue a TTS generation job
 */
export async function queueTTS(text: string, language: string, voice: string, speed: number = 0.85) {
  await ttsQueue.add('generate', {
    text,
    language,
    voice,
    speed,
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
}

/**
 * Queue an async logging job
 */
export async function queueLog(type: string, data: any) {
  await loggingQueue.add('log', {
    type,
    data,
  }, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}

/**
 * Queue a metrics aggregation job
 */
export async function queueMetrics(type: 'daily' | 'weekly' | 'monthly', seniorId: string | undefined, date: string) {
  await metricsQueue.add('aggregate', {
    type,
    seniorId,
    date,
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
}

/**
 * Schedule daily metrics aggregation (call this from a cron job)
 */
export async function scheduleDailyMetrics() {
  const today = new Date().toISOString().split('T')[0];
  
  await queueMetrics('daily', undefined, today);
  
  console.log(`Scheduled daily metrics aggregation for ${today}`);
}

export default {
  ttsQueue,
  loggingQueue,
  metricsQueue,
  queueTTS,
  queueLog,
  queueMetrics,
  scheduleDailyMetrics,
};


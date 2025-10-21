// Background worker entry point
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { processTTSJob } from './processors/tts-processor';
import { processLoggingJob } from './processors/logging-processor';
import { processMetricsJob } from './processors/metrics-processor';

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

// TTS Worker - Pre-generate TTS audio for common phrases
const ttsWorker = new Worker(
  'tts-generation',
  async (job) => {
    console.log(`Processing TTS job ${job.id}`);
    return await processTTSJob(job.data);
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  }
);

// Logging Worker - Async logging to database
const loggingWorker = new Worker(
  'async-logging',
  async (job) => {
    console.log(`Processing logging job ${job.id}`);
    return await processLoggingJob(job.data);
  },
  {
    connection,
    concurrency: 10,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 100 },
  }
);

// Metrics Worker - Aggregate daily metrics
const metricsWorker = new Worker(
  'metrics-aggregation',
  async (job) => {
    console.log(`Processing metrics job ${job.id}`);
    return await processMetricsJob(job.data);
  },
  {
    connection,
    concurrency: 3,
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 50 },
  }
);

// Error handling
ttsWorker.on('failed', (job, err) => {
  console.error(`TTS job ${job?.id} failed:`, err);
});

loggingWorker.on('failed', (job, err) => {
  console.error(`Logging job ${job?.id} failed:`, err);
});

metricsWorker.on('failed', (job, err) => {
  console.error(`Metrics job ${job?.id} failed:`, err);
});

// Success logging
ttsWorker.on('completed', (job) => {
  console.log(`TTS job ${job.id} completed`);
});

loggingWorker.on('completed', (job) => {
  console.log(`Logging job ${job.id} completed`);
});

metricsWorker.on('completed', (job) => {
  console.log(`Metrics job ${job.id} completed`);
});

console.log('Workers started successfully!');
console.log('- TTS Generation Worker');
console.log('- Async Logging Worker');
console.log('- Metrics Aggregation Worker');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down workers...');
  await Promise.all([
    ttsWorker.close(),
    loggingWorker.close(),
    metricsWorker.close(),
  ]);
  await connection.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down workers...');
  await Promise.all([
    ttsWorker.close(),
    loggingWorker.close(),
    metricsWorker.close(),
  ]);
  await connection.quit();
  process.exit(0);
});


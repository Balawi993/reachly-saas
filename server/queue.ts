import Bull from 'bull';
import Redis from 'ioredis';
import logger from './logger';

// ============ Redis Configuration ============

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// إنشاء Redis client للاستخدام العام
export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('connect', () => {
  logger.info('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error('❌ Redis connection error', { error: err });
});

// ============ Bull Queue Configuration ============

const queueOptions = {
  redis: redisUrl,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 200, // Keep last 200 failed jobs
  },
};

// ============ Campaign Queues ============

/**
 * Queue for DM Campaign processing
 */
export const campaignQueue = new Bull('dm-campaigns', queueOptions);

campaignQueue.on('error', (error) => {
  logger.error('❌ Campaign queue error', { error });
});

campaignQueue.on('completed', (job, result) => {
  logger.info('✅ Campaign job completed', { jobId: job.id, result });
});

campaignQueue.on('failed', (job, err) => {
  logger.error('❌ Campaign job failed', { jobId: job?.id, error: err });
});

/**
 * Queue for Follow Campaign processing
 */
export const followQueue = new Bull('follow-campaigns', queueOptions);

followQueue.on('error', (error) => {
  logger.error('❌ Follow queue error', { error });
});

followQueue.on('completed', (job, result) => {
  logger.info('✅ Follow job completed', { jobId: job.id, result });
});

followQueue.on('failed', (job, err) => {
  logger.error('❌ Follow job failed', { jobId: job?.id, error: err });
});

// ============ Queue Helper Functions ============

/**
 * Add a campaign to the processing queue
 */
export async function addCampaignJob(campaignId: number): Promise<void> {
  try {
    await campaignQueue.add(
      'process-campaign',
      { campaignId },
      {
        jobId: `campaign-${campaignId}`,
        repeat: {
          every: 1000, // Check every second
        },
      }
    );
    logger.info('✅ Campaign job added to queue', { campaignId });
  } catch (error) {
    logger.error('❌ Failed to add campaign job', { campaignId, error });
    throw error;
  }
}

/**
 * Remove a campaign from the processing queue
 */
export async function removeCampaignJob(campaignId: number): Promise<void> {
  try {
    const jobId = `campaign-${campaignId}`;
    const job = await campaignQueue.getJob(jobId);
    if (job) {
      await job.remove();
      logger.info('✅ Campaign job removed from queue', { campaignId });
    }
  } catch (error) {
    logger.error('❌ Failed to remove campaign job', { campaignId, error });
    throw error;
  }
}

/**
 * Add a follow campaign to the processing queue
 */
export async function addFollowJob(campaignId: number): Promise<void> {
  try {
    await followQueue.add(
      'process-follow',
      { campaignId },
      {
        jobId: `follow-${campaignId}`,
        repeat: {
          every: 1000, // Check every second
        },
      }
    );
    logger.info('✅ Follow job added to queue', { campaignId });
  } catch (error) {
    logger.error('❌ Failed to add follow job', { campaignId, error });
    throw error;
  }
}

/**
 * Remove a follow campaign from the processing queue
 */
export async function removeFollowJob(campaignId: number): Promise<void> {
  try {
    const jobId = `follow-${campaignId}`;
    const job = await followQueue.getJob(jobId);
    if (job) {
      await job.remove();
      logger.info('✅ Follow job removed from queue', { campaignId });
    }
  } catch (error) {
    logger.error('❌ Failed to remove follow job', { campaignId, error });
    throw error;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  try {
    const [
      campaignWaiting,
      campaignActive,
      campaignCompleted,
      campaignFailed,
      followWaiting,
      followActive,
      followCompleted,
      followFailed,
    ] = await Promise.all([
      campaignQueue.getWaitingCount(),
      campaignQueue.getActiveCount(),
      campaignQueue.getCompletedCount(),
      campaignQueue.getFailedCount(),
      followQueue.getWaitingCount(),
      followQueue.getActiveCount(),
      followQueue.getCompletedCount(),
      followQueue.getFailedCount(),
    ]);

    return {
      campaigns: {
        waiting: campaignWaiting,
        active: campaignActive,
        completed: campaignCompleted,
        failed: campaignFailed,
      },
      follows: {
        waiting: followWaiting,
        active: followActive,
        completed: followCompleted,
        failed: followFailed,
      },
    };
  } catch (error) {
    logger.error('❌ Failed to get queue stats', { error });
    throw error;
  }
}

/**
 * Clean old jobs from queues
 */
export async function cleanQueues(): Promise<void> {
  try {
    await Promise.all([
      campaignQueue.clean(24 * 3600 * 1000, 'completed'), // Remove completed jobs older than 24h
      campaignQueue.clean(7 * 24 * 3600 * 1000, 'failed'), // Remove failed jobs older than 7 days
      followQueue.clean(24 * 3600 * 1000, 'completed'),
      followQueue.clean(7 * 24 * 3600 * 1000, 'failed'),
    ]);
    logger.info('✅ Queues cleaned successfully');
  } catch (error) {
    logger.error('❌ Failed to clean queues', { error });
  }
}

// Clean queues every 6 hours
setInterval(cleanQueues, 6 * 60 * 60 * 1000);

logger.info('✅ Queue system initialized');

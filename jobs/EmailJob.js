import { Queue, Worker } from 'bullmq';
import { defaultQueueConfig, redisConnection } from '../config/messagequeue.js';
import logger from '../config/logger.js';
import { sendEmail } from '../config/nodemailer.js';

export const emailQueueName = 'email-queue';

export const emailQueue = new Queue(emailQueueName, {
  connection: redisConnection,
  defaultJobOptions: defaultQueueConfig,
});

export const handler = new Worker(
  emailQueueName,
  async (job) => {
    console.log('the email worker related data is', job.data);
    const data = job.data;
    data?.map(async (item) => {
      await sendEmail(item.toEmail, item.subject, item.body);
    });
  },
  { connection: redisConnection }
);

handler.on('completed', (job) => {
  logger.info({ job: job, message: 'Job completed' });
  console.log(`the job ${job.id} is completed`);
});

handler.on('failed', (job) => {
  logger.error({ job: job, message: 'Job Failed' });
  console.log(`the job ${job.id} is failed`);
});

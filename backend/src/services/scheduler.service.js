import { Notification } from '../models/Notification.js';
import { notificationService } from './notification.service.js';
import { emitToUser } from '../socket.js';
import { logger } from '../config/logger.js';

export class SchedulerService {
  constructor() {
    this.intervalId = null;
    this.isProcessing = false;
    this.maxGracePeriodMs = 2 * 60 * 60 * 1000; // 2 hours grace period for missed notifications
  }

  /**
   * Process all pending notifications that are due (scheduledFor <= now).
   */
  async processDueNotifications() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      const dueNotifications = await Notification.find({
        scheduledFor: { $lte: now },
        processed: false,
        status: 'PENDING',
      }).limit(100);

      if (dueNotifications.length > 0) {
        logger.info(`[Scheduler] Found ${dueNotifications.length} due notifications to process`);
      }

      for (const notif of dueNotifications) {
        const scheduledTime = new Date(notif.scheduledFor).getTime();
        const ageMs = now.getTime() - scheduledTime;

        // Expiration check for server downtime
        if (ageMs > this.maxGracePeriodMs) {
          logger.warn(`[Scheduler] Notification ${notif._id} expired (age: ${Math.round(ageMs / 60000)} mins)`);
          notif.processed = true;
          notif.processedAt = now;
          notif.status = 'EXPIRED';
          await notif.save();
          continue;
        }

        // Check recipient preference
        const allowed = await notificationService.isCategoryAllowed(
          notif.recipient,
          notif.category,
          notif.priority
        );

        if (!allowed) {
          logger.info(`[Scheduler] Notification ${notif._id} skipped due to user preference`);
          notif.processed = true;
          notif.processedAt = now;
          notif.status = 'FAILED';
          await notif.save();
          continue;
        }

        // Mark delivered
        notif.processed = true;
        notif.processedAt = now;
        notif.status = 'DELIVERED';
        await notif.save();

        const notifObj = notif.toObject();

        // Real-time delivery via Socket.IO
        try {
          emitToUser(notif.recipient.toString(), 'notification:received', notifObj);
        } catch (err) {
          logger.warn('[Scheduler] Socket emission failed:', { message: err.message });
        }
      }
    } catch (error) {
      logger.error('[Scheduler] Error processing due notifications:', { error: error.message });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Schedule automatic interview reminders (24h, 1h, 15m before scheduled time).
   */
  async scheduleInterviewReminders(interview, recipientUserId) {
    if (!interview?.scheduledAt || !recipientUserId) return;
    const startTime = new Date(interview.scheduledAt).getTime();
    const now = Date.now();

    const reminders = [
      { time: startTime - 24 * 60 * 60 * 1000, label: '24 Hours', tag: '24H' },
      { time: startTime - 60 * 60 * 1000, label: '1 Hour', tag: '1H' },
      { time: startTime - 15 * 60 * 1000, label: '15 Minutes', tag: '15M' },
    ];

    for (const r of reminders) {
      if (r.time > now) {
        const idempotencyKey = `INTERVIEW_REMINDER_${r.tag}_${interview._id}_${recipientUserId}`;
        await notificationService.scheduleNotification({
          recipient: recipientUserId,
          type: 'INTERVIEW_SCHEDULED',
          category: 'INTERVIEW',
          priority: r.tag === '15M' ? 'HIGH' : 'NORMAL',
          title: `Interview Reminder (${r.label})`,
          message: `Your upcoming interview with ${interview.companyName || 'the recruiter'} is in ${r.label}.`,
          scheduledFor: new Date(r.time),
          actionUrl: '/student/interviews',
          actionType: 'NAVIGATE',
          metadata: { interviewId: interview._id },
          idempotencyKey,
        });
      }
    }
  }

  /**
   * Schedule automatic coding assessment reminders (24h, 1h, 15m before start time).
   */
  async scheduleAssessmentReminders(assessment, recipientUserIds = []) {
    if (!assessment?.startTime || !recipientUserIds.length) return;
    const startTime = new Date(assessment.startTime).getTime();
    const now = Date.now();

    const reminders = [
      { time: startTime - 24 * 60 * 60 * 1000, label: '24 Hours', tag: '24H' },
      { time: startTime - 60 * 60 * 1000, label: '1 Hour', tag: '1H' },
      { time: startTime - 15 * 60 * 1000, label: '15 Minutes', tag: '15M' },
    ];

    for (const userId of recipientUserIds) {
      for (const r of reminders) {
        if (r.time > now) {
          const idempotencyKey = `ASSESSMENT_REMINDER_${r.tag}_${assessment._id}_${userId}`;
          await notificationService.scheduleNotification({
            recipient: userId,
            type: 'ASSESSMENT_REMINDER',
            category: 'ASSESSMENT',
            priority: r.tag === '15M' ? 'HIGH' : 'NORMAL',
            title: `Assessment Starts in ${r.label}`,
            message: `Your technical coding assessment "${assessment.title}" starts in ${r.label}.`,
            scheduledFor: new Date(r.time),
            actionUrl: `/student/assessments/${assessment._id}`,
            actionType: 'NAVIGATE',
            metadata: { assessmentId: assessment._id },
            idempotencyKey,
          });
        }
      }
    }
  }

  /**
   * Schedule automatic job application deadline reminder (24h before deadline).
   */
  async scheduleJobDeadlineReminder(job, recipientUserIds = []) {
    if (!job?.deadline || !recipientUserIds.length) return;
    const deadlineTime = new Date(job.deadline).getTime();
    const reminderTime = deadlineTime - 24 * 60 * 60 * 1000;

    if (reminderTime > Date.now()) {
      for (const userId of recipientUserIds) {
        const idempotencyKey = `JOB_DEADLINE_24H_${job._id}_${userId}`;
        await notificationService.scheduleNotification({
          recipient: userId,
          type: 'JOB_DEADLINE_REMINDER',
          category: 'JOB',
          priority: 'NORMAL',
          title: `Application Deadline Tomorrow: ${job.title}`,
          message: `The application deadline for ${job.title} at ${job.companyName || 'Company'} closes in 24 hours.`,
          scheduledFor: new Date(reminderTime),
          actionUrl: `/student/jobs/${job._id}`,
          actionType: 'NAVIGATE',
          metadata: { jobId: job._id },
          idempotencyKey,
        });
      }
    }
  }

  /**
   * Start periodic background scheduler timer.
   */
  startScheduler(intervalMs = 30000) {
    if (this.intervalId) return;
    logger.info(`[Scheduler] Starting background notification scheduler (interval: ${intervalMs}ms)...`);
    this.intervalId = setInterval(() => this.processDueNotifications(), intervalMs);
    // Run initial check immediately
    this.processDueNotifications();
  }

  /**
   * Stop scheduler background timer.
   */
  stopScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('[Scheduler] Background notification scheduler stopped.');
    }
  }
}

export const schedulerService = new SchedulerService();

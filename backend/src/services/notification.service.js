import { Notification } from '../models/Notification.js';
import { NotificationPreference } from '../models/NotificationPreference.js';
import { emitToUser } from '../socket.js';
import { logger } from '../config/logger.js';

export class NotificationService {
  /**
   * Check if user preferences allow notification for this category.
   * Security & system notifications can NEVER be disabled.
   */
  async isCategoryAllowed(recipientId, category, priority) {
    if (priority === 'CRITICAL' || category === 'SYSTEM') return true;

    const prefs = await this.getPreferences(recipientId);
    if (!prefs || !prefs.categories) return true;

    const categoryMap = {
      APPLICATION: 'applications',
      INTERVIEW: 'interviews',
      ASSESSMENT: 'assessments',
      JOB: 'jobs',
      DRIVE: 'drives',
      RESUME: 'resume',
      PROFILE: 'profile',
      SYSTEM: 'system',
    };

    const key = categoryMap[category];
    if (key && prefs.categories[key] === false) {
      return false;
    }
    return true;
  }

  /**
   * Create & deliver an immediate notification.
   */
  async sendNotification(data) {
    const {
      recipient,
      type = 'GENERAL',
      category = 'APPLICATION',
      priority = 'NORMAL',
      title,
      message,
      actionUrl = '',
      actionType = 'VIEW',
      metadata = {},
      channel = 'IN_APP',
      idempotencyKey,
    } = data;

    // Idempotency check if key provided
    if (idempotencyKey) {
      const existing = await Notification.findOne({ idempotencyKey }).lean();
      if (existing) {
        logger.info(`[Notification] Idempotent hit for key: ${idempotencyKey}`);
        return existing;
      }
    }

    // Preference check
    const allowed = await this.isCategoryAllowed(recipient, category, priority);
    if (!allowed) {
      logger.info(`[Notification] Skipped for user ${recipient} due to category preference: ${category}`);
      return null;
    }

    const notification = await Notification.create({
      recipient,
      type,
      category,
      priority,
      title,
      message,
      actionUrl,
      actionType,
      metadata,
      channel,
      isRead: false,
      scheduledFor: new Date(),
      idempotencyKey,
      processed: true,
      processedAt: new Date(),
      status: 'DELIVERED',
    });

    const notifObj = notification.toObject();

    // Real-time socket emission
    try {
      emitToUser(recipient.toString(), 'notification:received', notifObj);
    } catch (err) {
      logger.warn('[Notification] Real-time socket emission failed:', { message: err.message });
    }

    return notifObj;
  }

  /**
   * Schedule a notification for future delivery.
   */
  async scheduleNotification(data) {
    const {
      recipient,
      type = 'GENERAL',
      category = 'APPLICATION',
      priority = 'NORMAL',
      title,
      message,
      scheduledFor,
      expiresAt,
      actionUrl = '',
      actionType = 'VIEW',
      metadata = {},
      channel = 'IN_APP',
      idempotencyKey,
    } = data;

    if (!scheduledFor) {
      throw new Error('scheduledFor date is required for scheduled notifications');
    }

    // Idempotency check
    if (idempotencyKey) {
      const existing = await Notification.findOne({ idempotencyKey }).lean();
      if (existing) return existing;
    }

    const notification = await Notification.create({
      recipient,
      type,
      category,
      priority,
      title,
      message,
      actionUrl,
      actionType,
      metadata,
      channel,
      isRead: false,
      scheduledFor: new Date(scheduledFor),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      idempotencyKey,
      processed: false,
      status: 'PENDING',
    });

    return notification.toObject();
  }

  /**
   * Get notifications for recipient with filtering and search.
   */
  async getNotifications(recipientId, options = {}) {
    const {
      category,
      priority,
      unreadOnly = false,
      search = '',
      page = 1,
      limit = 30,
    } = options;

    const skip = (page - 1) * limit;
    const filter = { recipient: recipientId, processed: true };

    if (unreadOnly) filter.isRead = false;
    if (category && category !== 'ALL') filter.category = category;
    if (priority && priority !== 'ALL') filter.priority = priority;

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { message: searchRegex },
        { category: searchRegex },
        { type: searchRegex },
      ];
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ recipient: recipientId, isRead: false, processed: true });

    return {
      notifications,
      unreadCount,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get unread notification count.
   */
  async getUnreadCount(userId) {
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
      processed: true,
    });
    return { unreadCount };
  }

  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAsUnread(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: false, readAt: null },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false, processed: true },
      { isRead: true, readAt: new Date() }
    );
    return { success: true, message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId, userId) {
    await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
    return { success: true, message: 'Notification deleted' };
  }

  async handleBulkAction(userId, ids = [], action = 'mark-read') {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false };

    if (action === 'mark-read') {
      await Notification.updateMany(
        { _id: { $in: ids }, recipient: userId },
        { isRead: true, readAt: new Date() }
      );
    } else if (action === 'mark-unread') {
      await Notification.updateMany(
        { _id: { $in: ids }, recipient: userId },
        { isRead: false, readAt: null }
      );
    } else if (action === 'delete') {
      await Notification.deleteMany({ _id: { $in: ids }, recipient: userId });
    }

    return { success: true, action };
  }

  async getPreferences(userId) {
    let prefs = await NotificationPreference.findOne({ user: userId }).lean();
    if (!prefs) {
      prefs = await NotificationPreference.create({
        user: userId,
        channels: { inApp: true, email: true, push: false },
        categories: {
          applications: true,
          interviews: true,
          assessments: true,
          jobs: true,
          drives: true,
          resume: true,
          profile: true,
          system: true,
        },
      });
      prefs = prefs.toObject();
    }
    return prefs;
  }

  async updatePreferences(userId, updates) {
    const prefs = await NotificationPreference.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true, upsert: true }
    );
    return prefs.toObject();
  }
}

export const notificationService = new NotificationService();
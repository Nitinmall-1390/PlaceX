import { Router } from 'express';
import { notificationService } from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/v1/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { category, priority, unreadOnly, search, page = 1, limit = 30 } = req.query;

  const result = await notificationService.getNotifications(req.user._id, {
    category,
    priority,
    unreadOnly: unreadOnly === 'true',
    search,
    page: Number(page),
    limit: Number(limit),
  });

  ApiResponse.ok(res, 'Notifications fetched successfully', result);
});

// GET /api/v1/notifications/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user._id);
  ApiResponse.ok(res, 'Unread count fetched', result);
});

// GET /api/v1/notifications/preferences
export const getPreferences = asyncHandler(async (req, res) => {
  const prefs = await notificationService.getPreferences(req.user._id);
  ApiResponse.ok(res, 'Notification preferences fetched', prefs);
});

// PATCH / PUT /api/v1/notifications/preferences
export const updatePreferences = asyncHandler(async (req, res) => {
  const prefs = await notificationService.updatePreferences(req.user._id, req.body);
  ApiResponse.ok(res, 'Notification preferences updated', prefs);
});

// POST /api/v1/notifications/schedule
export const scheduleNotification = asyncHandler(async (req, res) => {
  const data = { ...req.body, recipient: req.body.recipient || req.user._id };
  const notification = await notificationService.scheduleNotification(data);
  ApiResponse.created(res, 'Notification scheduled successfully', notification);
});

// PATCH /api/v1/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);
  ApiResponse.ok(res, result.message, result);
});

// POST /api/v1/notifications/bulk
export const bulkAction = asyncHandler(async (req, res) => {
  const { ids, action } = req.body;
  const result = await notificationService.handleBulkAction(req.user._id, ids, action);
  ApiResponse.ok(res, 'Bulk action completed', result);
});

// PATCH /api/v1/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  ApiResponse.ok(res, 'Notification marked as read', notification);
});

// PATCH /api/v1/notifications/:id/unread
export const markAsUnread = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsUnread(req.params.id, req.user._id);
  ApiResponse.ok(res, 'Notification marked as unread', notification);
});

// DELETE /api/v1/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteNotification(req.params.id, req.user._id);
  ApiResponse.ok(res, result.message, result);
});

// Route definitions (Specific routes FIRST before wildcard :id)
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.patch('/preferences', updatePreferences);
router.post('/schedule', scheduleNotification);
router.patch('/read-all', markAllAsRead);
router.post('/bulk', bulkAction);
router.patch('/:id/read', markAsRead);
router.patch('/:id/unread', markAsUnread);
router.delete('/:id', deleteNotification);

export default router;

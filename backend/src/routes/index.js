import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import companyRoutes from './company.routes.js';
import jobRoutes from './job.routes.js';
import applicationRoutes from './application.routes.js';
import driveRoutes from './drive.routes.js';
import notificationRoutes from './notification.routes.js';
import resumeRoutes from './resume.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

// System routes (health check)
router.use('/', healthRoutes);

// API v1 routes
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/students', studentRoutes);
router.use('/api/v1/companies', companyRoutes);
router.use('/api/v1/jobs', jobRoutes);
router.use('/api/v1/applications', applicationRoutes);
router.use('/api/v1/drives', driveRoutes);
router.use('/api/v1/notifications', notificationRoutes);
router.use('/api/v1/resumes', resumeRoutes);
router.use('/api/v1/analytics', analyticsRoutes);

export default router;

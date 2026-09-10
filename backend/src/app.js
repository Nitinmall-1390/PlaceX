import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middleware.js';
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import { healthCheck } from './controllers/health.controller.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import companyRoutes from './routes/company.routes.js';
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import driveRoutes from './routes/drive.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import atsRoutes from './routes/ats.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';
import tpoRoutes from './routes/tpo.routes.js';
import intelligenceRoutes from './routes/intelligence.routes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { ApiResponse } from './utils/ApiResponse.js';

const app = express();

// Trust reverse proxies (Render, Cloudflare, etc.)
app.set('trust proxy', 1);

// Security headers configured for cross-origin API and OAuth popups
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: false,
  })
);

// Enable CORS with origin reflection for all client apps
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Parse JSON requests
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse cookies
app.use(cookieParser());

// Request ID middleware
app.use(requestIdMiddleware);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

app.use('/api/', apiLimiter);

// Logging middleware
app.use(morgan('dev'));

// Base welcome & health check endpoints
const rootWelcome = (req, res) => {
  ApiResponse.ok(res, 'PlaceX Backend API is running', {
    system: 'PlaceX AI-Powered Campus Placement Management System',
    version: '1.0.0',
    status: 'OPERATIONAL',
    endpoints: {
      health: '/health',
      apiHealth: '/api/v1/health',
      docs: '/api-docs',
      auth: '/api/v1/auth',
    },
    timestamp: new Date().toISOString(),
  });
};

app.get('/', rootWelcome);
app.get('/api/v1', rootWelcome);

// Swagger API documentation
const swaggerUiOptions = {
  customSiteTitle: 'PlaceX API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.get('/api/v1/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint (supports GET, HEAD for uptime monitoring)
app.all('/health', healthCheck);
app.use('/api/v1', healthRoutes);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/drives', driveRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/ats', atsRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/tpo', tpoRoutes);
app.use('/api/v1/intelligence', intelligenceRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  ApiResponse.notFound(res, 'Route not found');
});

export default app;

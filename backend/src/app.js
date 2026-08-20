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
import { ApiResponse } from './utils/ApiResponse.js';

const app = express();

// Security headers
app.use(helmet());

// Enable CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl / Postman without origin
    if (!origin) return callback(null, true);

    // Allow all Vercel deployment domains (*.vercel.app)
    if (origin.endsWith('.vercel.app') || origin === 'https://vercel.app') {
      return callback(null, true);
    }

    // Allow exact matches from allowedOrigins or localhost
    if (allowedOrigins.includes(origin) || origin.includes('localhost') || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

// Parse JSON requests
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Cookie parser (for refresh token cookie)
app.use(cookieParser());

// Request ID middleware
app.use(requestIdMiddleware);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
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
      auth: '/api/v1/auth',
    },
    timestamp: new Date().toISOString(),
  });
};

app.get('/', rootWelcome);
app.get('/api/v1', rootWelcome);

// Health check endpoint
app.get('/health', healthCheck);
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

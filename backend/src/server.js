import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDatabase } from './config/database.js';
import { logger } from './config/logger.js';
import { initSocket } from './socket.js';
import { schedulerService } from './services/scheduler.service.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO instance
initSocket(server);

async function startServer() {
  try {
    // Connect to MongoDB first
    await connectDatabase();

    // Start background notification scheduler
    schedulerService.startScheduler();

    server.listen(PORT, () => {
      logger.info(`[Server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    server.on('error', (error) => {
      logger.error('[Server] Error:', { error: error.message });
      process.exit(1);
    });
  } catch (error) {
    logger.error('[Server] Startup failed:', { error: error.message });
    process.exit(1);
  }
}

startServer();
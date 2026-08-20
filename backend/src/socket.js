import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config/env.js';
import { logger } from './config/logger.js';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.corsOrigin || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication token required for Socket.IO'));
      }

      const decoded = jwt.verify(token, config.jwt.accessSecret);
      socket.user = decoded;
      next();
    } catch (err) {
      logger.warn('[Socket.IO] Authentication failed:', { message: err.message });
      next(new Error('Unauthorized Socket.IO connection'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id;
    if (userId) {
      const userRoom = `user_${userId}`;
      socket.join(userRoom);
      logger.info(`[Socket.IO] User ${userId} connected to ${userRoom}`);
    }

    socket.on('disconnect', () => {
      logger.info(`[Socket.IO] User ${userId} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    logger.warn('[Socket.IO] Socket server not initialized yet');
  }
  return io;
};

export const emitToUser = (userId, event, payload) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, payload);
  }
};

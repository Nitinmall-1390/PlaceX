import { io, type Socket } from 'socket.io-client';
import { getStorage } from '../api/storage';
import { STORAGE_KEYS } from '../../constants';
import type { Notification } from '../../types';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): void {
    if (this.socket?.connected) return;

    const token = getStorage(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(socketUrl, {
      transports: ['websocket'],
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('[Socket] Connected');
    });

    this.socket.on('disconnect', (reason: string) => {
      this.isConnected = false;
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('notification', (notification: Notification) => {
      window.dispatchEvent(new CustomEvent('notification:new', { detail: notification }));
    });

    this.socket.on('notification:update', (data: { unreadCount: number }) => {
      window.dispatchEvent(new CustomEvent('notification:update', { detail: data }));
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('[Socket] Connection error:', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  emit(event: string, data?: unknown): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: unknown) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: unknown) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

export const socketService = new SocketService();
export default socketService;
